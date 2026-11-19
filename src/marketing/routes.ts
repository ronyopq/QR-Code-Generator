/**
 * Landing pages — one real URL per search intent.
 *
 * A single-page app can only rank for what is on that one page. Each entry here
 * becomes a static, JS-free page at `/<path>/` during the build (see
 * `scripts/prerender.mjs`), with its own <title>, description, canonical, OG
 * card, breadcrumb, HowTo and FAQ schema — and it is added to sitemap.xml and
 * llms.txt automatically.
 *
 * Rules for the copy in this file:
 *   • answer the question in the first two sentences (`lede`), then explain
 *   • no filler, no keyword stuffing, no claims the app cannot keep
 *   • every page must be genuinely different from its siblings — Google treats
 *     near-duplicates as doorway pages
 */
import type { Faq } from './content'

export interface LandingSection {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export interface LandingRoute {
  /** URL path without a trailing slash, e.g. `/wifi-qr-code`. */
  path: string
  /** QR type this page links into the studio with (`/?type=<typeId>`). */
  typeId: string
  /** ≤ 60 characters; the page's <title>. */
  title: string
  /** ≤ 160 characters; meta description and og:description. */
  description: string
  h1: string
  /** Answer-first opening paragraph. */
  lede: string
  /** Short label used on the home page and in cross-links. */
  navLabel: string
  sections: LandingSection[]
  howTo: { name: string; steps: { name: string; text: string }[] }
  faq: Faq[]
  /** Sibling paths for internal linking. */
  related: string[]
  /** ISO date, emitted as dateModified. */
  updated: string
}

const UPDATED = '2026-11-19'

export const LANDING_ROUTES: LandingRoute[] = [
  {
    path: '/wifi-qr-code',
    typeId: 'wifi',
    title: 'WiFi QR Code Generator — Free, No Sign-Up | QRForge',
    description:
      'Make a WiFi QR code that joins the network on the first scan. Free, no app, no account. Print it on a card and guests connect without typing a password.',
    h1: 'WiFi QR code generator: guests join with one scan',
    lede:
      'A WiFi QR code stores the network name, password and encryption type so a phone can join the network without anyone typing it. QRForge builds one in the browser in about ten seconds, and nothing is uploaded.',
    navLabel: 'WiFi QR code',
    sections: [
      {
        heading: 'What is actually inside the code',
        paragraphs: [
          'The code holds a single line of text in the WIFI: format — for example WIFI:T:WPA;S:CafeGuest;P:flatwhite2026;;. T is the encryption type (WPA covers WPA2 and WPA3, WEP is the old one, nopass is an open network), S is the network name, P is the password, and an optional H:true marks a hidden network.',
          'Modern phones understand this natively: iPhone from iOS 11 and Android from Android 10 open the join prompt straight from the camera app. Older devices may need a third-party scanner, which is worth knowing if your guests carry older hardware.',
        ],
      },
      {
        heading: 'Print it big enough to work at arm’s length',
        paragraphs: [
          'A table card is scanned from 20–40 cm, so the modules must stay large. For a short password QRForge recommends at least 3 × 3 cm of printed code; the scan check reports the module size in millimetres for your chosen print width and warns when a module drops below 0.4 mm.',
          'Matte paper beats glossy stock — a glossy card under a window reflects the very light the camera needs. Keep the quiet zone white, keep the contrast high, and avoid printing white modules on a dark card unless you test it with two phones first.',
        ],
        bullets: [
          'Table tents, fridge magnets and counter cards: 3–4 cm',
          'A4 sheet by the door: 6–8 cm',
          'Never below 2 cm, even for a very short password',
        ],
      },
      {
        heading: 'Share the guest network, not your main one',
        paragraphs: [
          'Anyone who photographs the code has the password — that is the point of it. Put the code on a guest network with client isolation, so a shared key cannot be used to reach your printer, NAS or laptop. If the password changes, the printed code stops working: regenerate it and swap the card.',
          'For a shop or café, a rotating guest password plus a fresh print each quarter is a small task that keeps the network honest. QRForge keeps every setting in your browser, so regenerating takes seconds.',
        ],
      },
    ],
    howTo: {
      name: 'How to create a WiFi QR code',
      steps: [
        { name: 'Pick the WiFi type', text: 'Open the studio and choose WiFi Network from the format rail.' },
        { name: 'Enter the SSID and password', text: 'Type the network name exactly as it appears on the router, then the password, and choose WPA unless the network is open.' },
        { name: 'Check the module size', text: 'Set the print width you will actually use and confirm the scan check says the module size is printable — 0.4 mm or more.' },
        { name: 'Export and test', text: 'Download a PDF or SVG for print, then scan the file from a second phone before you send it to the printer.' },
      ],
    },
    faq: [
      {
        q: 'Does a WiFi QR code work on iPhone and Android?',
        a: 'Yes. iPhone scans it from the Camera app on iOS 11 and later, and Android does the same from Android 10. Older versions may need a dedicated QR scanner app, and the code still works there.',
      },
      {
        q: 'Can I hide the password in a WiFi QR code?',
        a: 'No. The password is stored inside the pattern, so anyone who scans the code can read it with a decoder. The safe approach is a guest network with its own password rather than trying to obscure the code.',
      },
      {
        q: 'My network is hidden — will it still work?',
        a: 'Set the hidden flag when you build the code and most modern phones will join correctly. Some older devices still need the SSID typed manually once, so keep a written card behind the counter as a fallback.',
      },
      {
        q: 'What happens if I change the WiFi password?',
        a: 'A WiFi QR code is static: the password is part of the pattern, so the old card simply stops working. Generate a new code with the new password and replace the printed cards — nothing to log in to, nothing to expire.',
      },
    ],
    related: ['/menu-qr-code', '/vcard-qr-code', '/url-qr-code'],
    updated: UPDATED,
  },

  {
    path: '/vcard-qr-code',
    typeId: 'vcard',
    title: 'vCard QR Code Generator — Digital Business Card | QRForge',
    description:
      'Turn your contact details into a vCard QR code. Name, phone, email and company save straight into the phone’s contacts with one scan. Free and private.',
    h1: 'vCard QR code: the business card that saves itself',
    lede:
      'A vCard QR code carries your contact details in the vCard format, so scanning it adds you to the other person’s address book instead of opening a website. QRForge writes the vCard for you and exports it at print resolution.',
    navLabel: 'vCard / contact',
    sections: [
      {
        heading: 'What gets saved on the other phone',
        paragraphs: [
          'QRForge writes vCard 3.0, the version every phone understands: name, phone, email, company, job title, website and address. When someone scans it, iOS offers “Add to Contacts” and Android opens the contact editor pre-filled — one tap and you are saved, complete with a phone number they can call.',
          'Because the data is in the code itself, nothing needs a server. That is also why it works at a conference with no signal, in a lift, or years after the card was printed.',
        ],
      },
      {
        heading: 'Shorter codes scan faster — and from further away',
        paragraphs: [
          'Every extra character pushes the QR version up, which adds modules and shrinks each one at a fixed print size. A name plus one phone number is roughly 60 characters and scans comfortably at 2 cm; a full vCard with address, job title and three links can pass 250 characters and needs 3–4 cm to stay reliable.',
          'The practical rule: put the four fields you actually want called on, and skip the rest. If you need your whole profile, put a link to it instead — a 30-character URL keeps the code small and lets you change the profile later.',
        ],
        bullets: [
          'Name + phone + email + company: comfortably 2.5 cm',
          'Adding address and title: print 3 cm or more',
          'A logo in the middle costs error-correction budget — keep it under 20 % of the area and use level H',
        ],
      },
      {
        heading: 'Where a vCard code earns its keep',
        paragraphs: [
          'Print it on the back of a paper card, on a lanyard badge, at the counter of a shop, in an invoice footer or on a name plate at a trade stand. Add it as an image to your email signature and it works on desktop too — most clients show the picture, and a phone camera can read it straight off the screen.',
          'One caveat worth repeating: static means permanent. If your phone number changes, the old card will save the old number. Order a fresh batch of cards when your details change, or keep a link-based code in reserve.',
        ],
      },
    ],
    howTo: {
      name: 'How to make a vCard QR code',
      steps: [
        { name: 'Choose Contact vCard', text: 'Open the studio, pick the vCard type and fill in the fields you want people to keep.' },
        { name: 'Review the payload', text: 'The preview lists the encoded vCard text — check the number in international format before you print a hundred cards.' },
        { name: 'Set the print size', text: 'Aim for 2.5–3 cm for a business card back, and confirm the scan check reports a printable module size.' },
        { name: 'Save and test', text: 'Export a PDF or SVG, then scan the file with a phone that does not already have your contact saved.' },
      ],
    },
    faq: [
      {
        q: 'Can I update a vCard QR code after printing it?',
        a: 'No. The contact data is inside the pattern, so the code is fixed. If details change you need a new code and a new print run — or use a link-based QR code to a profile page you control.',
      },
      {
        q: 'Can I put my photo in the vCard?',
        a: 'The vCard spec allows an embedded photo, but phone scanners handle it inconsistently and the file becomes long, which forces a denser code. A link to your profile or portfolio page is more reliable.',
      },
      {
        q: 'How big should a vCard QR code be on a business card?',
        a: 'Around 2.5 cm square for a name, phone, email and company. If the card also carries an address and a long job title, go to 3 cm or drop a field, because the extra characters mean more modules in the same space.',
      },
      {
        q: 'Which phone apps can read it?',
        a: 'Every stock camera app on iOS and Android reads vCard codes and offers to save the contact. No special app, no account and no network connection required.',
      },
    ],
    related: ['/whatsapp-qr-code', '/url-qr-code', '/wifi-qr-code'],
    updated: UPDATED,
  },

  {
    path: '/menu-qr-code',
    typeId: 'menu',
    title: 'Restaurant Menu QR Code — Free Generator | QRForge',
    description:
      'Create a menu QR code for a restaurant or café. Print it on the table, guests scan and the menu opens — no subscription, no expiry, no app to install.',
    h1: 'Menu QR code for restaurants and cafés',
    lede:
      'A menu QR code is a link to your menu page, printed on the table so guests can open it without an app. QRForge makes a static code that never expires and needs no subscription — you own the link, you own the code.',
    navLabel: 'Restaurant menu',
    sections: [
      {
        heading: 'Static or dynamic? Know what you are buying',
        paragraphs: [
          'Every menu QR code is either static (the URL is baked into the pattern) or dynamic (a short link that redirects, tracked by a paid service). Static is free and permanent; the trade-off is that changing the URL means reprinting the cards.',
          'The middle path most restaurants should take: point the static code at a short link you control — your own domain, or a page on your site with a fixed address — and change what that page shows whenever you like. You get permanent print and editable content without a subscription.',
        ],
      },
      {
        heading: 'Make it scannable across a table',
        paragraphs: [
          'Table distance is roughly 30–60 cm, so the code should be at least 3 cm square — 4 cm is safer in dim light, where some cameras struggle. Print on matte stock, keep the code away from a glossy varnish band, and never place it behind glass that catches the ceiling lights.',
          'Add one line of instruction next to it: “Scan for the menu”. Half of QR codes fail socially, not technically — people do not know what will happen when they scan, so they do not scan.',
        ],
        bullets: [
          'Table tent: 3–4 cm, matte, flat on the table',
          'Window sticker: 6 cm or more, high contrast',
          'Keep the quiet zone white — no border art touching the modules',
        ],
      },
      {
        heading: 'What the menu page itself must do',
        paragraphs: [
          'The scan is only the first step; the page has to be pleasant on a phone. Mobile-first layout, readable prices without pinch-zoom, no login wall, no autoplaying video and no 8 MB PDF. A plain HTML page that loads in under two seconds beats an elaborate one that does not.',
          'Update prices in the same place you update the kitchen — a page you can edit from the till. If a dish is sold out, the page should say so; that is the whole advantage over a laminated menu.',
        ],
      },
      {
        heading: 'Keep paper menus on request',
        paragraphs: [
          'Some guests have no smartphone, some have a flat battery, and some simply prefer paper. A QR code should be an option, not a barrier — keep two or three printed menus behind the counter and the room stays welcoming to everyone.',
        ],
      },
    ],
    howTo: {
      name: 'How to create a menu QR code',
      steps: [
        { name: 'Put the menu online first', text: 'Publish the menu at a stable https address — a page on your site or a short link you control, not a PDF that gets replaced every week.' },
        { name: 'Choose Restaurant Menu in the studio', text: 'Paste the URL, check the preview, and keep the URL as short as you can so the code stays sparse.' },
        { name: 'Style it, then check it scans', text: 'A plain black-on-white code survives greasy tables and bad light best. Confirm the scan check reports a printable size before you trust a brand colour.' },
        { name: 'Print at 3–4 cm and test on the table', text: 'Print one card, scan it from where a guest sits, then order the rest.' },
      ],
    },
    faq: [
      {
        q: 'Does a menu QR code expire?',
        a: 'Not the one QRForge makes. It is static, meaning the URL is inside the pattern — there is no subscription and no service that can switch it off. The code stays valid as long as the page it points to exists.',
      },
      {
        q: 'How do I change the menu without reprinting?',
        a: 'Point the code at a page you control and update that page. If you change the destination URL instead, every printed card becomes useless, so keep the address stable from day one.',
      },
      {
        q: 'How big should a table QR code be?',
        a: 'At least 3 cm square, 4 cm if the room is dim or the URL is long. Bigger is always better on a table: the guest is 30–60 cm away and often holding the phone at an angle.',
      },
      {
        q: 'Do guests need an app?',
        a: 'No. The camera app on iOS and Android reads the code and opens the link in the browser. Nothing to install, nothing to sign up for.',
      },
    ],
    related: ['/wifi-qr-code', '/url-qr-code', '/vcard-qr-code'],
    updated: UPDATED,
  },

  {
    path: '/whatsapp-qr-code',
    typeId: 'whatsapp',
    title: 'WhatsApp QR Code Generator — Chat in One Scan | QRForge',
    description:
      'Generate a WhatsApp QR code that opens a chat with your number and a prefilled message. Works on phone and desktop, free, and nothing is uploaded.',
    h1: 'WhatsApp QR code that opens a chat',
    lede:
      'A WhatsApp QR code is a wa.me link with your number — scanning it opens a chat, usually with a prefilled message. QRForge builds one in the browser, formats the number correctly, and exports it for print.',
    navLabel: 'WhatsApp chat',
    sections: [
      {
        heading: 'The link behind the code',
        paragraphs: [
          'WhatsApp’s official click-to-chat address is https://wa.me/<number>?text=<message>. The number must be in international format with digits only: country code first, no plus sign, no leading zero, no spaces or dashes. For Bangladesh a number beginning 017… becomes 88017… in the link.',
          'QRForge validates the number and writes the link for you, and it strips the characters that quietly break a chat — a “+” pasted from a contact card is the single most common cause of a dead code.',
        ],
      },
      {
        heading: 'Prefilled messages: short beats clever',
        paragraphs: [
          'The message text is part of the URL, so every character makes the pattern denser. “Hi! I’d like to order” is plenty; a paragraph of marketing copy forces a bigger code that needs a bigger print.',
          'The message also arrives unsent in the input box, not as a message — the customer still taps send. Word it as an opening line that makes that tap obvious: a question, a product name, or “Table 4” if the code is on a table.',
        ],
        bullets: [
          'Keep the prefilled text under about 60 characters',
          'Use the customer’s side of the conversation, not your brand voice',
          'Test the code from a phone that does not have your number saved',
        ],
      },
      {
        heading: 'Where it works best',
        paragraphs: [
          'Print it on the shop counter, the delivery bag, the invoice, the van, the market stall banner or a name card. It also belongs online: paste the same link in an Instagram bio, a marketplace listing or a Google Business profile so every channel lands in the same inbox.',
          'One honest limitation: WhatsApp has no “business hours” gate. If the code is on a shop window and you are closed, messages still arrive — set an away message in WhatsApp Business so people are not left waiting.',
        ],
      },
      {
        heading: 'Test before you print a hundred',
        paragraphs: [
          'Scan the code from a phone without your number in its contacts, and check that the right chat opens with the right message. Then try it with WhatsApp not installed — wa.me falls back to the web page, which is what a customer on a laptop sees.',
        ],
      },
    ],
    howTo: {
      name: 'How to make a WhatsApp QR code',
      steps: [
        { name: 'Choose WhatsApp in the studio', text: 'Pick the WhatsApp type and enter the number in international format — 880… for Bangladesh, digits only.' },
        { name: 'Add the opening message', text: 'Write a short line the customer would send, such as “Hi, I have a question about…”, and check the preview shows the wa.me link.' },
        { name: 'Export at storefront size', text: '5 cm or more for a window, 2.5–3 cm for a card. Verify the scan check reports a printable module size.' },
        { name: 'Scan it from two phones', text: 'One with WhatsApp installed, one without, and confirm the chat and the prefilled text are both correct.' },
      ],
    },
    faq: [
      {
        q: 'Do I need WhatsApp Business to use a QR code?',
        a: 'No. A wa.me link works with any WhatsApp account. WhatsApp Business adds labels, quick replies and an away message, which are useful once the volume grows, but the code itself is the same.',
      },
      {
        q: 'Why does my WhatsApp QR code open nothing?',
        a: 'Almost always the number format: a leading “+”, a leading zero, spaces or a missing country code. Use digits only, starting with the country code — for example 8801712345678.',
      },
      {
        q: 'Can I make a QR code for a WhatsApp group?',
        a: 'Yes, but not with the number field. Copy the group invite link (chat.whatsapp.com/…) and build it as a URL type instead — that link can also be revoked, which the group number route cannot.',
      },
      {
        q: 'Is my phone number visible in the code?',
        a: 'Yes. The number is part of the link and anyone can decode it. Only use a number you are happy to publish, and use a business number rather than your personal one if the code goes on a shop window.',
      },
    ],
    related: ['/vcard-qr-code', '/url-qr-code', '/menu-qr-code'],
    updated: UPDATED,
  },

  {
    path: '/url-qr-code',
    typeId: 'url',
    title: 'URL QR Code Generator — Print-Ready Links | QRForge',
    description:
      'Turn any link into a QR code you can print, stick or share. Free, no account, no redirect that can expire. Export PNG, SVG, PDF or an A4 sticker sheet.',
    h1: 'URL QR code generator that prints cleanly',
    lede:
      'A URL QR code stores a link directly in the pattern, so it needs no server and never expires. QRForge encodes it in your browser and exports print-ready PNG, SVG, PDF or a six-per-page A4 sheet.',
    navLabel: 'URL / website',
    sections: [
      {
        heading: 'Shorter link, fewer modules, longer scanning distance',
        paragraphs: [
          'The length of the URL decides the QR version, and the version decides how many modules the symbol has. A 25-character link is version 2 (25 × 25 modules); an 80-character link with tracking parameters is version 5 (37 × 37) and can carry more than twice the modules for the same printed size.',
          'That matters in the real world: with each module half as wide, the camera needs roughly half the distance, or twice the print size. Before adding utm_ parameters, ask whether you will ever read the analytics. If not, cut the link down.',
        ],
        bullets: [
          '2 × 2 cm — a short link, scanned from 20–30 cm',
          '3 × 3 cm — comfortable on a table card or a flyer',
          '8 cm or more — a poster or a window, read from 1–2 m',
        ],
      },
      {
        heading: 'Static means permanent — including the mistakes',
        paragraphs: [
          'A static code has no redirect service behind it, which is exactly why it cannot expire, run out of scans or be switched off when a subscription lapses. The flip side: if the page moves, the printed code is dead.',
          'The safe pattern is a link you control — your own domain, or a short path like /menu that you can re-point later. Treat 301 redirects as part of the design, not as an afterthought after 500 flyers are printed.',
        ],
      },
      {
        heading: 'Right format for the job',
        paragraphs: [
          'Use SVG or PDF when a printer will handle it: vector edges stay sharp at any size, and there is no resampling to blur the modules. Use PNG at 300 DPI or higher when the code goes into Word, PowerPoint, Canva or a social post — 1024 px is enough for a table card, 2048 px for a poster.',
          'The A4 print sheet in QRForge lays out six codes with 12 mm margins and 6 mm gaps, with the name and a “scan me” caption — the fastest way to produce a batch of identical stickers without touching a design tool.',
        ],
      },
      {
        heading: 'After printing, test it under real light',
        paragraphs: [
          'Scan the test print from the distance your reader will actually stand, in the light they will actually have, with the app they will actually use. A code that works on a bright screen can still fail on a matte flyer at 40 cm in a dim room — the scan check tells you the numbers, but only a test print tells you the truth.',
        ],
      },
    ],
    howTo: {
      name: 'How to create a URL QR code',
      steps: [
        { name: 'Shorten the link you are printing', text: 'Drop tracking parameters you will never read, and use a stable path on your own domain rather than a free shortener that may shut down.' },
        { name: 'Paste it into the studio', text: 'Choose URL / Website, paste the link and watch the live preview update as you type.' },
        { name: 'Pick the size and check the density', text: 'Set the print width, then read the module size in the scan check — under 0.4 mm per module will fail on cheap paper.' },
        { name: 'Export the format the printer needs', text: 'SVG or PDF for professional print, PNG at 300 DPI for documents, A4 sheet when you need a batch of stickers.' },
      ],
    },
    faq: [
      {
        q: 'Do QR codes for URLs expire?',
        a: 'Not static ones. The link is inside the pattern, so nothing needs to stay online for the code to work — only the destination page. Codes from paid services expire only because they run through a redirect server that can be switched off.',
      },
      {
        q: 'Can I track how many people scan it?',
        a: 'Not with a static code — there is no server to count requests, which is also why it is private. If you need counts, use a redirect service you control and accept that the code then depends on that service staying online.',
      },
      {
        q: 'Which export format should I give a printing shop?',
        a: 'SVG or PDF. Both are vector, so the modules keep crisp edges at any size and the printer will not resample the image. Ask for matte stock and no spot varnish over the code area.',
      },
      {
        q: 'How long a URL can a QR code hold?',
        a: 'Technically about 4,000 characters at the lowest error correction, but reliability collapses long before that. Keep URLs under roughly 300 characters and use error correction level M or H for print.',
      },
    ],
    related: ['/menu-qr-code', '/whatsapp-qr-code', '/vcard-qr-code'],
    updated: UPDATED,
  },
]

export function findRoute(path: string): LandingRoute | undefined {
  const clean = path.replace(/\/+$/, '') || '/'
  return LANDING_ROUTES.find((r) => r.path === clean)
}

/** Sitemap entries: the studio plus every landing page. */
export function sitemapEntries(): { path: string; priority: string; changefreq: string; lastmod?: string }[] {
  return [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    ...LANDING_ROUTES.map((r) => ({
      path: r.path,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: r.updated,
    })),
  ]
}
