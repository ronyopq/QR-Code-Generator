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
  {
    path: '/email-qr-code',
    typeId: 'email',
    title: 'Email QR Code Generator — Scan to Compose | QRForge',
    description:
      'Make a QR code that opens a new email with the address, subject and message filled in. Free, no account, exports as PNG, SVG or PDF for print.',
    h1: 'Email QR code that opens a ready-to-send message',
    lede:
      'An email QR code is a mailto: link: scanning it opens a new message with your address already in the To field, and optionally a subject and body. QRForge writes and encodes it in the browser — nothing is uploaded.',
    navLabel: 'Email',
    sections: [
      {
        heading: 'What the code actually does',
        paragraphs: [
          'The pattern holds a mailto: address such as mailto:hello@studio.com?subject=Saw%20your%20flyer&body=Hi%20there. The phone opens whichever mail app is installed — Gmail, Apple Mail or Outlook — with those fields prefilled. The customer still taps send, which is exactly the point: no typed address, no typos.',
          'Spaces and punctuation must be percent-encoded, which QRForge does for you. A single stray space in a hand-built mailto: link is the usual reason a code opens a blank composer or nothing at all.',
        ],
      },
      {
        heading: 'Keep it short enough to print small',
        paragraphs: [
          'Every character in the subject and body adds modules. An address alone is around 30 characters and prints comfortably at 2 cm; adding a 40-character subject pushes it to about 3 cm for the same reliability. If you want a pre-written message, keep it under roughly 60 characters — “Hi, I saw your stand at the expo” is plenty.',
          'For feedback forms and event enquiries, a link to a real form beats a mailto: code. A form captures structured data, works when no mail app is configured on the phone, and never opens an empty draft that nobody sends.',
        ],
        bullets: [
          'Address only: 2 cm square is enough',
          'Address + subject: 2.5 cm',
          'Address + subject + body: 3 cm, and test on a phone with only a webmail client',
        ],
      },
      {
        heading: 'Where it works, and where it does not',
        paragraphs: [
          'Email codes shine on printed material: a conference stand, an invoice footer, a poster, a product box for warranty claims. They fail in one specific case — a phone with no mail app configured, common on tablets and on Android devices used only with a browser. Always print the address in text next to the code as a fallback.',
          'Also remember that the recipient address is public. Anyone can decode the code and see it, so use a role address you can retire (hello@, support@) rather than a personal one.',
        ],
      },
    ],
    howTo: {
      name: 'How to create an email QR code',
      steps: [
        { name: 'Choose Email in the studio', text: 'Pick the Email type and enter the address you want enquiries to reach.' },
        { name: 'Add a subject if it helps', text: 'A short, specific subject sorts the mail into a folder and tells you where the scan came from.' },
        { name: 'Check the preview length', text: 'Long bodies make the code dense; keep the prefilled text under about 60 characters for small prints.' },
        { name: 'Export and test on two phones', text: 'Scan with a phone that has a mail app and one that does not, then print the address as text beside the code.' },
      ],
    },
    faq: [
      {
        q: 'Does an email QR code work without a mail app?',
        a: 'No. The code opens a mailto: handler, so a phone with no mail app configured will show an error or nothing at all. Print the address next to the code, or link to a web form instead if that device mix matters.',
      },
      {
        q: 'Can I prefill the subject and the message?',
        a: 'Yes. QRForge encodes both after the question mark of the mailto: link, percent-encoding spaces and punctuation. Keep the total short — every character makes the symbol denser and the print size bigger.',
      },
      {
        q: 'Will it open Gmail or the default mail app?',
        a: 'Whichever app the phone has registered as its mail handler — Gmail on most Android phones, Apple Mail or Gmail on iOS. The code cannot force a specific app, and it does not need to.',
      },
      {
        q: 'Is the email address visible to everyone?',
        a: 'Yes, it is inside the pattern and any scanner app can read it in plain text. Use a role address such as hello@ or support@ that you can change later, rather than a personal mailbox.',
      },
    ],
    related: ['/phone-qr-code', '/sms-qr-code', '/vcard-qr-code'],
    updated: UPDATED,
  },

  {
    path: '/phone-qr-code',
    typeId: 'phone',
    title: 'Phone Number QR Code — Tap to Call | QRForge',
    description:
      'Create a QR code that dials your number with one tap. Free, no app, no account. Print it on a van, a poster or a card and skip the typing.',
    h1: 'Phone number QR code: one scan, one call',
    lede:
      'A phone QR code holds a tel: link, so scanning it offers to dial the number immediately — no typing, no misdialled digits. QRForge encodes it in your browser and exports it at print resolution.',
    navLabel: 'Phone call',
    sections: [
      {
        heading: 'What is inside the code',
        paragraphs: [
          'The payload is a tel: URI, for example tel:+8801712345678. The country code belongs in the link: without it a foreign visitor’s phone may dial the wrong country or refuse to dial at all. Keep the plus sign and drop spaces, brackets and dashes — they are not part of the number and some phones choke on them.',
          'On a phone the scanner offers “Call”; on a desktop browser the code usually does nothing, which is expected. It is a mobile-first format, not a web link.',
        ],
      },
      {
        heading: 'Where a call code earns its place',
        paragraphs: [
          'On a delivery van, a shop shutter, a plumber’s flyer, a taxi window or a poster at a bus stop — anywhere a person sees the number and would otherwise have to remember it. It also works well beside a “no phone while driving” notice: the passenger can scan instead of the driver typing.',
          'If the call is not urgent but a message would be better received, pair the phone code with a WhatsApp or SMS code. People scan one, use whichever channel they prefer, and you stop losing enquiries to voicemail.',
        ],
        bullets: [
          'Include the country code: +880 for Bangladesh',
          'Print at 2–2.5 cm — a tel: link is short, so the code stays sparse',
          'Always print the number as text too, for phones without a dialler prompt',
        ],
      },
      {
        heading: 'The one thing that breaks phone codes',
        paragraphs: [
          'Formatting. A number with spaces, a leading zero after the country code or an unusual separator can make the dialler open with a truncated number. Test the finished code on two different phones — one iPhone, one Android — because the two handle tel: URIs slightly differently.',
          'If the number changes, the printed code is dead: there is no redirect in a static code. Keep a small batch of cards rather than a large print run until the number is stable.',
        ],
      },
    ],
    howTo: {
      name: 'How to create a phone QR code',
      steps: [
        { name: 'Pick Phone Call', text: 'Open the studio and choose the Phone Call type.' },
        { name: 'Enter the number with country code', text: 'Digits and a leading plus only — +8801712345678, no spaces or dashes.' },
        { name: 'Keep the print small but legible', text: 'A tel: payload is short, so 2–2.5 cm is plenty; confirm the scan check reports a printable module size.' },
        { name: 'Test on both platforms', text: 'Scan with an iPhone and an Android phone and check the dialler opens with the complete number.' },
      ],
    },
    faq: [
      {
        q: 'Does a phone QR code work on a computer?',
        a: 'Usually not — desktop browsers have no dialler, so nothing happens. That is expected: the format is meant for phones, and printing it on a poster that people read on foot is the right use.',
      },
      {
        q: 'Should I include the country code?',
        a: 'Yes. Without it, visitors with a foreign SIM may dial an unrelated local number or fail to connect. Use the full international form with a leading plus, for example +8801712345678.',
      },
      {
        q: 'Why does the dialler open with a wrong number?',
        a: 'Almost always stray characters — spaces, brackets, dashes or a leading zero after the country code. Re-enter the number as digits with a single leading plus and regenerate the code.',
      },
      {
        q: 'Can one code call a different number depending on the time?',
        a: 'No. A static code always dials the same number. If you need routing — office hours to the desk, evenings to a mobile — use a phone system that handles the routing and point the code at its main number.',
      },
    ],
    related: ['/sms-qr-code', '/email-qr-code', '/vcard-qr-code'],
    updated: UPDATED,
  },

  {
    path: '/sms-qr-code',
    typeId: 'sms',
    title: 'SMS QR Code Generator — Prefilled Text Message | QRForge',
    description:
      'Create an SMS QR code that opens a text message with your number and a prefilled body. Free, no account, print-ready PNG, SVG or PDF.',
    h1: 'SMS QR code with a prefilled message',
    lede:
      'An SMS QR code opens the phone’s messaging app addressed to your number, with the message already typed. It is the simplest way to collect a keyword reply — “JOIN”, “TABLE 4”, “ORDER” — from a printed sign.',
    navLabel: 'SMS',
    sections: [
      {
        heading: 'What the code contains',
        paragraphs: [
          'The payload is an sms: URI — sms:+8801712345678?body=JOIN. The phone opens its default messaging app with the number filled in and the body typed, then the person taps send. That single tap is the whole conversion: no remembering a shortcode, no mistyping a keyword.',
          'Support for the body varies slightly between platforms. iOS and Android both accept it today, but a small number of older Android builds drop the body and leave only the number, so a printed instruction beside the code keeps the reply correct either way.',
        ],
      },
      {
        heading: 'Keep the keyword short and shout it in print',
        paragraphs: [
          'The message lives in the QR payload, so every character widens the code slightly. One word in capitals is ideal: JOIN, YES, BOOK, TABLE4. A short keyword also survives if someone retypes it manually — which is what happens when the scan fails.',
          'Print the keyword next to the code in large type. “Scan and send JOIN” converts far better than a bare square, because the person can see what the action will cost them: one tap and one SMS.',
        ],
        bullets: [
          'Keyword only: 2 cm square is enough',
          'Keyword + a short sentence: print 2.5 cm',
          'Never rely on the prefilled body alone — print the keyword too',
        ],
      },
      {
        heading: 'SMS or WhatsApp?',
        paragraphs: [
          'SMS works on every phone with no app, no data plan and no account, which is why it still wins for rural audiences, older devices and events with mixed hardware. It costs the sender a message and it is asynchronous, so it suits sign-ups, queues and competitions rather than conversations.',
          'WhatsApp is free per message and reaches people where they already talk, but requires the app and a data connection. If both matter, print two codes side by side — the pair covers practically everyone.',
        ],
      },
    ],
    howTo: {
      name: 'How to create an SMS QR code',
      steps: [
        { name: 'Choose SMS Message', text: 'Pick the SMS type in the studio and enter the number in international format.' },
        { name: 'Type the keyword', text: 'One short capitalised word — the reply your system or inbox is waiting for.' },
        { name: 'Print the keyword beside the code', text: 'A caption prevents wrong replies when a phone drops the prefilled body.' },
        { name: 'Scan and send once yourself', text: 'Confirm the message arrives with the number and keyword intact before the print run.' },
      ],
    },
    faq: [
      {
        q: 'Does the prefilled message always appear?',
        a: 'On current iOS and Android, yes. A few older Android builds ignore the body parameter and open an empty message to the right number, which is why printing the keyword next to the code matters.',
      },
      {
        q: 'Will scanning cost the customer anything?',
        a: 'Sending an SMS may cost them a message on their plan, and they will see the composer before sending — so nothing is charged silently. Say so on the sign if it is a paid-message region.',
      },
      {
        q: 'Can I use a shortcode instead of a number?',
        a: 'Yes, if your provider supports it — enter the shortcode in the number field. Shortcodes are premium-rate in some countries, so check the rules before printing one on a public sign.',
      },
      {
        q: 'Why does SMS still beat a web form?',
        a: 'It needs no data connection, no browser and no account. For a queue ticket, a competition entry or a rural campaign, an SMS lands even when the phone has no internet at all.',
      },
    ],
    related: ['/phone-qr-code', '/email-qr-code', '/whatsapp-qr-code'],
    updated: UPDATED,
  },

  {
    path: '/text-qr-code',
    typeId: 'text',
    title: 'Text QR Code Generator — Plain Text, No Link | QRForge',
    description:
      'Turn any text into a QR code — a serial number, a note, an instruction. No server, no link, nothing to expire. Free, and it works offline.',
    h1: 'Text QR code: information with no link behind it',
    lede:
      'A text QR code stores plain words in the pattern itself. There is no URL, no server and nothing that can go offline — the message works as long as the print survives.',
    navLabel: 'Plain text',
    sections: [
      {
        heading: 'When plain text is the right choice',
        paragraphs: [
          'Use text when there is nothing to open: a serial number on a machine, a spare-part code, a short instruction in a place with no signal, a note inside a geocache, a Wi-Fi-less safety checklist, or a one-time password printed on a ticket stub.',
          'It is also the most durable format. A link code breaks if a domain lapses; a text code breaks only if the paper does. For anything meant to outlive a website, write the content into the code.',
        ],
      },
      {
        heading: 'How much text fits, in practice',
        paragraphs: [
          'The theoretical maximum is around 4,000 characters at the lowest error correction, but nobody should print that: the symbol becomes a grey mush at any normal size. Keep a text code under about 300 characters for a 3 cm print, and under 100 characters if it must work at 2 cm.',
          'For longer content, split it: a short text code with a reference number, and the detail on a page or a form. The person scanning gets what they need without a magnifying glass.',
        ],
        bullets: [
          'Up to ~100 characters: prints cleanly at 2 cm',
          '100–300 characters: 3 cm or larger',
          'Over 300 characters: use a link instead',
        ],
      },
      {
        heading: 'Print and placement notes',
        paragraphs: [
          'Text codes are read at close range — 10–20 cm — so a 2 cm square on a machine plate is realistic, while a 5 cm code on a wall is overkill. Keep the surface flat: a label wrapped around a cylinder distorts the modules and the camera struggles even when the code is technically valid.',
          'Remember that the text is public. Never put a password, a PIN or personal data into a plain text code and assume it is hidden — it is not encryption, just encoding.',
        ],
      },
    ],
    howTo: {
      name: 'How to create a text QR code',
      steps: [
        { name: 'Choose Plain Text', text: 'Pick the Text type and type whatever should appear on the scanner’s screen.' },
        { name: 'Keep it under 300 characters', text: 'Watch the live preview: the code grows denser as you type, and the scan check reports the resulting module size.' },
        { name: 'Pick the print size for the reading distance', text: '2 cm for a machine label read at arm’s length, 3 cm or more for anything on a wall.' },
        { name: 'Export and test in real conditions', text: 'Print one copy, scan it where it will actually live, then commit to the batch.' },
      ],
    },
    faq: [
      {
        q: 'Does a text QR code need internet?',
        a: 'No. The words are inside the pattern, so the scanner shows them with no connection at all — which is why text codes are used on machines, in basements and in places with no signal.',
      },
      {
        q: 'How many characters can it hold?',
        a: 'Technically about 4,000 at the lowest error correction, but printing that is pointless. Keep it under 300 characters for a readable 3 cm print and under 100 for 2 cm.',
      },
      {
        q: 'Is the text encrypted?',
        a: 'No. Encoding is not encryption: any scanner app shows the text immediately, and a person can decode it with pen and paper if they are patient. Never put a password or PIN in a text code.',
      },
      {
        q: 'Can I include line breaks or emoji?',
        a: 'Yes, modern scanners show both, but each one costs characters and depends on the scanner app’s font support. For critical labels stick to plain uppercase letters and digits.',
      },
    ],
    related: ['/url-qr-code', '/social-qr-code', '/wifi-qr-code'],
    updated: UPDATED,
  },

  {
    path: '/location-qr-code',
    typeId: 'location',
    title: 'Location QR Code — Scan to Open Maps | QRForge',
    description:
      'Create a QR code that opens your address or coordinates in Google Maps. Free, no account, no app. Print it on invitations, signs and delivery notes.',
    h1: 'Location QR code: send people straight to the pin',
    lede:
      'A location QR code opens a map at your exact coordinates or address, so a guest, courier or visitor never has to copy an address into a search box. It is the smallest fix for the “where exactly is this place?” message.',
    navLabel: 'Location',
    sections: [
      {
        heading: 'Coordinates or address — what goes in',
        paragraphs: [
          'The payload is either a geo: URI with latitude and longitude, or a map link built from a text query. Coordinates are precise but unforgiving: swap the latitude and longitude, or round too early, and the pin lands in another neighbourhood. Six decimal places is roughly 10 cm of accuracy — plenty.',
          'An address query is friendlier to build and survives a bad pin, but it depends on how well the map provider understands the phrasing. For venues with a name — “Café X, Road 11, Banani” — the query usually beats raw numbers because it also carries the landmark.',
        ],
      },
      {
        heading: 'Size it for a poster, not a business card',
        paragraphs: [
          'A location code is scanned while standing or walking, often from 40–80 cm away, so print it at 3–5 cm. On a wedding invitation or a delivery note 2.5 cm is enough, because the reader is holding the paper.',
          'Put the address in text underneath as well. Guests scan, couriers read, and people with no data plan still know where to go. A code is an accelerator, never the only copy of the information.',
        ],
        bullets: [
          'Invitation, receipt, delivery slip: 2.5 cm',
          'Shop window, gate sign, poster: 4 cm or more',
          'Always print the address as text too',
        ],
      },
      {
        heading: 'Two mistakes worth avoiding',
        paragraphs: [
          'The first is a pin placed at the street entrance of a large campus — people then walk the perimeter. Drop the pin at the door they should actually use, and say so in the caption: “Use the north gate”.',
          'The second is linking to a platform-specific map. Google Maps links open on iOS and Android through the app if installed, and in the browser if not. If your audience does not use Google Maps, use the address query and let the phone choose.',
        ],
      },
    ],
    howTo: {
      name: 'How to create a location QR code',
      steps: [
        { name: 'Choose Location', text: 'Pick the Location type in the studio.' },
        { name: 'Enter the place or the coordinates', text: 'A name plus address is more forgiving; latitude and longitude are exact but must be in the right order.' },
        { name: 'Print at walking distance size', text: '2.5 cm for paper in someone’s hand, 4 cm or more for a sign they walk up to.' },
        { name: 'Check the pin, not just the link', text: 'Scan it and confirm the map marker sits on the door you want people to use.' },
      ],
    },
    faq: [
      {
        q: 'Does a location QR code open Google Maps or Apple Maps?',
        a: 'A geo: coordinate usually prompts the phone’s default map app; a maps.google.com link opens Google Maps or the browser. If you need a specific app, link to that service directly.',
      },
      {
        q: 'How many decimals do coordinates need?',
        a: 'Six decimals is about 10 cm of accuracy, far more than anyone needs for a door. Four decimals is roughly 10 m, still fine for a building, but not for choosing between two gates.',
      },
      {
        q: 'Why does my pin land in the wrong place?',
        a: 'The usual cause is swapped latitude and longitude, or a comma decimal separator replaced by a dot. Latitude always comes first and ranges from -90 to 90; longitude ranges from -180 to 180.',
      },
      {
        q: 'Can the code show the address instead of opening a map?',
        a: 'Yes — use a plain text code if you want the address itself on screen. A location code is for people who want directions, so pairing the two is often the best answer.',
      },
    ],
    related: ['/vcard-qr-code', '/event-qr-code', '/url-qr-code'],
    updated: UPDATED,
  },

  {
    path: '/event-qr-code',
    typeId: 'event',
    title: 'Event QR Code — Add to Calendar in One Scan | QRForge',
    description:
      'Make an event QR code with date, time and location that saves straight to the phone calendar. Free, no account, print-ready for invites and posters.',
    h1: 'Event QR code that saves the date properly',
    lede:
      'An event QR code carries a calendar entry — title, start, end, place and notes — so scanning it offers “Add to Calendar” instead of another link someone will forget to open.',
    navLabel: 'Event',
    sections: [
      {
        heading: 'Why a calendar entry beats a link',
        paragraphs: [
          'A link to an event page ends the interaction at the browser. A calendar entry ends it inside the app people actually check, with a reminder attached. For talks, workshops, weddings, matches and open days, that is the difference between “sounds good” and actually turning up.',
          'The payload is an iCalendar VEVENT with SUMMARY, DTSTART, DTEND, LOCATION and DESCRIPTION. Because it is a file format rather than a service, it works with Apple Calendar, Google Calendar and Outlook without an account or an internet connection at scan time.',
        ],
      },
      {
        heading: 'Get the date fields exactly right',
        paragraphs: [
          'Time zones are the trap. A start time without a zone is read as local time on the scanning phone, which silently shifts the event for anyone in another country. QRForge writes local date-times (the 2026-12-01T10:00 form), which is correct for a local audience and easy to check in a preview.',
          'Also make the end time later than the start, keep the title under roughly 60 characters, and put the door time, ticket link and dress code in the description rather than the title. Calendars truncate titles aggressively.',
        ],
        bullets: [
          'Title + start + end: 3 cm is a comfortable print size',
          'Adding a full address and notes pushes it to 3.5–4 cm',
          'Use the same date format you see in the preview — never retype it by hand',
        ],
      },
      {
        heading: 'Print it where the decision happens',
        paragraphs: [
          'On a poster the code belongs near the date, not in a corner: people scan at the moment they decide. On a flyer, put it on the front. At a venue, a sign at the door works for people already there — for a recurring event, print the next date, not “every Thursday”.',
          'Always print the date and venue as text beside it. A person with a dead battery, an old phone or a strict calendar policy still needs to know when to show up.',
        ],
      },
    ],
    howTo: {
      name: 'How to create an event QR code',
      steps: [
        { name: 'Choose Event / Calendar', text: 'Pick the Event type and fill in the title first — it is what appears in the calendar list.' },
        { name: 'Set a start and an end', text: 'Use the date-time fields rather than typing a string, and make sure the end is after the start.' },
        { name: 'Add the place and the practical notes', text: 'Door time, ticket link and parking belong in the description; the address belongs in the location field.' },
        { name: 'Scan and add it yourself', text: 'Confirm the entry lands on the right day and hour in a calendar app before you print the batch.' },
      ],
    },
    faq: [
      {
        q: 'Does the event code need an internet connection?',
        a: 'No. The calendar entry is inside the pattern, so the phone can add it while offline. Only a link in the description would need a connection — and that stays a link, not part of the event itself.',
      },
      {
        q: 'Which calendar apps understand it?',
        a: 'Apple Calendar, Google Calendar and Outlook all read VEVENT data from a scan. On Android the scanner usually offers “Add to calendar”; on iOS the calendar app opens with the entry ready to save.',
      },
      {
        q: 'Why is my event one hour off for other people?',
        a: 'Because the date was written without a time zone and the scanning phone is in a different one. For a local event, local time is correct — for a hybrid or international audience, state the zone in the title.',
      },
      {
        q: 'Can one code cover a recurring event?',
        a: 'It can carry a recurrence rule, but phone support varies and the code grows. For weekly events it is clearer to print a code for the next specific date and update it as you go.',
      },
    ],
    related: ['/location-qr-code', '/vcard-qr-code', '/menu-qr-code'],
    updated: UPDATED,
  },

  {
    path: '/pdf-qr-code',
    typeId: 'pdf',
    title: 'PDF QR Code — Share a Document by Scan | QRForge',
    description:
      'Link a menu, brochure, price list or manual as a PDF and let people scan to open it. Free QR code generator, print-ready, no redirect that expires.',
    h1: 'PDF QR code: a document behind a square',
    lede:
      'A PDF QR code is simply a link to a PDF file — the code itself is a normal URL code. What decides whether it works is how the PDF behaves on a phone, and that is worth designing for.',
    navLabel: 'PDF link',
    sections: [
      {
        heading: 'How phones actually handle a PDF',
        paragraphs: [
          'On iOS Safari a PDF opens in the built-in reader; on Android Chrome it usually downloads and then opens in Drive or a viewer. Desktop browsers open their own reader. That means the scan result is not identical everywhere, and a 20 MB catalogue on a weak connection feels broken even when it works.',
          'The practical limits: keep the file under about 5 MB, keep the first page self-explanatory in case it opens in a preview thumbnail, and give the file a human filename — menu-2026.pdf reads far better in a download list than doc_final_v3.pdf.',
        ],
      },
      {
        heading: 'Link length is what you are really controlling',
        paragraphs: [
          'Because the payload is a URL, the code’s density depends on the address, not on the PDF. A 30-character path prints at 2 cm; a link with tracking parameters and a nested folder structure can double the module count and force 3.5 cm.',
          'Serve it over https from a stable path you control. A PDF at a shared drive link that expires, or a free host that shuts down, kills every printed code at once — the classic own-goal of a static QR code.',
        ],
        bullets: [
          'Short path: 2 cm works',
          'Long CMS or drive links: print 3 cm or more',
          'Never use a file link that can expire',
        ],
      },
      {
        heading: 'When a PDF is the wrong answer',
        paragraphs: [
          'A menu, a price list or a timetable is better as a web page: it loads faster, reflows to the screen, can be updated without reprinting and is readable by search engines. A PDF is right for documents that must look identical — a certificate, a signed contract, a print catalogue, a technical drawing.',
          'If you must share a PDF, add the page count and the file size beside the code. “Menu (2 pages, 1 MB)” sets an expectation that avoids an abandoned download.',
        ],
      },
    ],
    howTo: {
      name: 'How to create a PDF QR code',
      steps: [
        { name: 'Publish the PDF at a stable https URL', text: 'Your own domain or a host that will still exist next year — not a temporary share link.' },
        { name: 'Shorten the path before encoding', text: 'Upload it as /menu-2026.pdf rather than a long generated path; fewer characters mean a smaller, easier-to-scan code.' },
        { name: 'Choose URL / Website in the studio', text: 'Paste the link, then check the module size for the print width you plan to use.' },
        { name: 'Scan it on both platforms', text: 'Confirm iOS previews it and Android downloads and opens it before the print run.' },
      ],
    },
    faq: [
      {
        q: 'Can a QR code contain a PDF file itself?',
        a: 'Not usefully. A QR code holds at most a few kilobytes, while PDFs run into megabytes, so every real-world PDF code is a link to the file rather than the file itself.',
      },
      {
        q: 'Why does the PDF download instead of opening?',
        a: 'That is the phone’s browser policy — Android Chrome often downloads to the Downloads folder, while iOS Safari previews inline. Tell people what to expect in the caption: “Scan to download the menu”.',
      },
      {
        q: 'How big should the PDF be?',
        a: 'Under about 5 MB for a mobile audience. Compress images before uploading, and never scan a paper document at 600 DPI for something people will open on 4G.',
      },
      {
        q: 'What happens if I replace the PDF later?',
        a: 'If the URL stays the same, the printed code keeps working and shows the new file — that is why a stable path matters. If you change the URL, every printed code points at the old one.',
      },
    ],
    related: ['/menu-qr-code', '/url-qr-code', '/app-download-qr-code'],
    updated: UPDATED,
  },

  {
    path: '/app-download-qr-code',
    typeId: 'app',
    title: 'App Download QR Code — One Scan, Right Store | QRForge',
    description:
      'Send people to the App Store or Google Play with a single scan — or one code that detects the device. Free QR code generator, print-ready.',
    h1: 'App download QR code for both stores',
    lede:
      'An app download code usually points at a store listing. The hard part is not the QR code, it is sending an iPhone to the App Store and an Android phone to Google Play without printing two squares.',
    navLabel: 'App download',
    sections: [
      {
        heading: 'One code, two stores',
        paragraphs: [
          'Two routes work. The first is a smart link: a page on your domain that reads the user agent and redirects to the right store — one URL, one code, and you control the fallback for desktop visitors. The second is a store-detection page that shows both badges, which is slower but never misfires.',
          'Two separate codes work too, labelled clearly. It is uglier, but it removes every dependency on redirect logic, and for a table stand where people are already holding a phone it converts perfectly well.',
        ],
        bullets: [
          'Smart link on your own domain: one code, needs server logic',
          'Two labelled codes: zero logic, zero surprises',
          'Never link straight to one store if the audience is mixed',
        ],
      },
      {
        heading: 'Store links are long — plan the print size',
        paragraphs: [
          'A Play Store URL with a package name runs past 60 characters; an App Store URL with an app id is similar. That lands the code around 3 cm for a reliable scan, so a 2 cm badge will frustrate people.',
          'Custom short links help, but only if you own the domain and keep it alive. A third-party shortener that folds takes every printed code with it — the same trap as any static link.',
        ],
      },
      {
        heading: 'What to print next to it',
        paragraphs: [
          'State the platform explicitly — “iPhone?” and “Android?” above the matching code — and add one line of what the app does. Store pages are crowded; the poster has to do the selling, not the listing.',
          'Also give people a fallback: the app name in text, or your site URL. Some corporate phones block store links, and a QR code that leads to a blocked page looks like your fault.',
        ],
      },
    ],
    howTo: {
      name: 'How to create an app download QR code',
      steps: [
        { name: 'Get both store URLs', text: 'Copy the App Store and Google Play links from each listing, or create one smart link that redirects by device.' },
        { name: 'Choose URL / Website', text: 'Paste the smart link, or encode each store URL as its own code if you are printing two.' },
        { name: 'Size for a poster, not a badge', text: 'Store URLs are long — print at 3 cm or more and check the module size in the scan check.' },
        { name: 'Test on both platforms', text: 'Scan with an iPhone and an Android device, and confirm each lands on the correct listing.' },
      ],
    },
    faq: [
      {
        q: 'Can one QR code open the App Store for iPhone and Google Play for Android?',
        a: 'Yes, but the redirect happens on a web page — the code points at your smart link and the page sends each device to its store. A QR code itself cannot detect the operating system.',
      },
      {
        q: 'Why does my store link make a dense QR code?',
        a: 'Store URLs carry long package names and ids. Shorter custom links reduce the module count, which means the same print size scans from further away.',
      },
      {
        q: 'What should a desktop visitor see?',
        a: 'A page showing both badges plus a short description. That is the usual weak spot of app codes: someone scans on a laptop and lands on a store page that offers nothing useful.',
      },
      {
        q: 'Do I need two codes?',
        a: 'Only if you prefer no redirect logic. Two clearly labelled codes are perfectly effective at a stand — and they keep working even if your smart-link service goes down.',
      },
    ],
    related: ['/url-qr-code', '/youtube-qr-code', '/pdf-qr-code'],
    updated: UPDATED,
  },

  {
    path: '/instagram-qr-code',
    typeId: 'instagram',
    title: 'Instagram QR Code — Open Your Profile | QRForge',
    description:
      'Make an Instagram QR code that opens your profile in one scan. Free, no account, print-ready for packaging, cafés and business cards.',
    h1: 'Instagram QR code for your profile',
    lede:
      'An Instagram QR code holds a link to your profile — instagram.com/yourname — and opens the Instagram app if it is installed. It is the fastest way to turn a paper cup, a parcel or a stall into a follower.',
    navLabel: 'Instagram',
    sections: [
      {
        heading: 'Profile link, not a post link',
        paragraphs: [
          'A profile URL is short, stable and works everywhere. A link to a single post or reel is long, contains a tracking code that changes, and often opens a login wall or an “open in app” interstitial instead of the content. For print, always point at the profile.',
          'One exception worth knowing: if the account is private, a stranger who scans gets a follow request prompt rather than your grid. Decide whether a public profile — or a separate public account for the campaign — is what you actually want.',
        ],
      },
      {
        heading: 'Print placement does the work',
        paragraphs: [
          'The best performing placements are physical things people already hold: coffee cups, paper bags, delivery boxes, price tags, receipts, table tents, market stall signage. A 2–2.5 cm code is enough because the reader is holding the object; on a poster it needs 4 cm.',
          'Caption it with the payoff, not the platform name. “See today’s bakes” beats “Follow us on Instagram” — and always print the handle as text, so people who never scan can still find you by search.',
        ],
        bullets: [
          'Cups, bags, receipts: 2–2.5 cm',
          'Counter card, table tent: 3 cm',
          'Poster or window: 4–5 cm',
        ],
      },
      {
        heading: 'What breaks Instagram codes',
        paragraphs: [
          'Renaming the handle is the big one: the printed code is static, so it points at the old name forever. Changing a handle also releases the old one, which someone else can claim — a genuinely bad outcome for printed material.',
          'The second is link hygiene. Avoid adding query parameters you found in a share sheet, and never shorten an Instagram link through a service that might expire. The profile URL is short enough already.',
        ],
      },
    ],
    howTo: {
      name: 'How to create an Instagram QR code',
      steps: [
        { name: 'Choose Instagram', text: 'Pick the Instagram type and enter your handle — the studio builds instagram.com/<handle> for you.' },
        { name: 'Check the preview URL', text: 'Make sure the handle is exact, with no capital letters that do not exist on the account.' },
        { name: 'Size it for the object it goes on', text: '2–2.5 cm on packaging held in hand, 4 cm on anything read from a distance.' },
        { name: 'Scan with and without the app', text: 'One test opens Instagram, one opens the browser — both must land on the same profile.' },
      ],
    },
    faq: [
      {
        q: 'Does the QR code open the Instagram app?',
        a: 'Usually yes: Instagram registers itself as a handler for its own links, so a scan opens the app on a phone that has it installed and the browser on one that does not.',
      },
      {
        q: 'What happens if I change my username?',
        a: 'Every printed code keeps pointing at the old link and stops working. Worse, someone else can register the released name. Decide on the handle before you print, or use your own domain as a redirect you can re-point.',
      },
      {
        q: 'Can I link to a specific post or reel?',
        a: 'You can, but the URL is long, includes tracking parameters, and often lands on a login wall. For anything printed, the profile is the more reliable destination.',
      },
      {
        q: 'Does it work for a private account?',
        a: 'The link opens, but a stranger sees a follow request, not your content. If the purpose is discovery, make the account public or create a public marketing account for the campaign.',
      },
    ],
    related: ['/facebook-qr-code', '/youtube-qr-code', '/social-qr-code'],
    updated: UPDATED,
  },

  {
    path: '/facebook-qr-code',
    typeId: 'facebook',
    title: 'Facebook QR Code — Page or Profile by Scan | QRForge',
    description:
      'Create a Facebook QR code that opens your page in one scan, or a Messenger chat link. Free, no account, print-ready PNG, SVG or PDF.',
    h1: 'Facebook QR code for a page, profile or chat',
    lede:
      'A Facebook QR code is a link to your page — facebook.com/yourpage — or, for conversations, an m.me chat link that opens Messenger directly. Which one you print depends on whether you want followers or messages.',
    navLabel: 'Facebook',
    sections: [
      {
        heading: 'Page, profile, group or chat',
        paragraphs: [
          'Four different things can sit behind the square. A page is the business face and what most printed material should point at. A profile is personal. A group link only works for people who can join, and membership questions make it a poor choice on a poster.',
          'A chat link — m.me/yourpage — opens Messenger with the conversation ready. That converts better than a page for anything service-shaped: orders, bookings, questions. Print the page code if you want reach, the chat code if you want a message.',
        ],
      },
      {
        heading: 'Use the vanity URL, never the numeric one',
        paragraphs: [
          'Pages have two addresses: a readable username and a long numeric profile id. The readable one is shorter, survives workspace migrations better and is what people can type if the scan fails. Set the username in the page settings first, then build the code.',
          'If the page URL changes — a rename, a merge — printed codes point at the old address. Facebook normally redirects renamed usernames for a while, but “for a while” is not a print strategy.',
        ],
        bullets: [
          'Page: 2.5 cm is plenty — the URL is short',
          'Chat link (m.me): 2.5 cm',
          'Group with questions: avoid; use the page instead',
        ],
      },
      {
        heading: 'Placement and the follow-through',
        paragraphs: [
          'Facebook is a low-intent platform compared with chat apps: people scan, glance and leave. Give them a reason in the caption — a menu, an offer, opening hours that change — and pin that post on the page before the print run, so the first thing a new visitor sees justifies the scan.',
          'As always, print the page name in text. It also protects you from a detail that catches many people out: in some regions Facebook links open an interstitial asking which app to use, which looks broken even when it is not.',
        ],
      },
    ],
    howTo: {
      name: 'How to create a Facebook QR code',
      steps: [
        { name: 'Get your page username', text: 'Copy the readable URL from the page — facebook.com/yourpage — not the numeric id.' },
        { name: 'Choose Facebook in the studio', text: 'Paste the username or the full page URL; the studio normalises it into a valid link.' },
        { name: 'Decide page or chat', text: 'Use m.me/<page> for messages, the page URL for reach, and print them as two codes if you need both.' },
        { name: 'Scan once on each platform', text: 'Check the app opens on the right page, and that the browser fallback lands there too.' },
      ],
    },
    faq: [
      {
        q: 'Should the code point at my page or my profile?',
        a: 'A page for anything business-related: it survives staff changes and can run ads. A personal profile is for individuals — and its privacy settings may hide most of the content from a stranger anyway.',
      },
      {
        q: 'Can a QR code open Messenger instead?',
        a: 'Yes — use the m.me link for your page. Scanning opens the Messenger conversation, which is better for orders and bookings than a page a visitor has to explore.',
      },
      {
        q: 'Why does the code open a browser instead of the app?',
        a: 'On phones without the Facebook app installed, the link falls back to the browser. That is the expected behaviour, and the page still loads — no data is lost.',
      },
      {
        q: 'Does it work for groups?',
        a: 'A group link works only for people allowed to see the group, and membership questions can block a scan entirely. For public material, link to the page and pin the group there.',
      },
    ],
    related: ['/instagram-qr-code', '/youtube-qr-code', '/social-qr-code'],
    updated: UPDATED,
  },

  {
    path: '/youtube-qr-code',
    typeId: 'youtube',
    title: 'YouTube QR Code — Channel or Video by Scan | QRForge',
    description:
      'Create a YouTube QR code for a channel or a single video. Free, no account, print-ready — with the short youtu.be form that keeps the code sparse.',
    h1: 'YouTube QR code for a channel or a video',
    lede:
      'A YouTube QR code is a link to a channel or a video. The short youtu.be form matters more than anything else here: it keeps the symbol sparse, which is what makes it scan from across a room.',
    navLabel: 'YouTube',
    sections: [
      {
        heading: 'Short video links, long video links',
        paragraphs: [
          'A full watch URL can look like youtube.com/watch?v=ID&list=…&index=4&t=95s — over 70 characters and full of parameters a printed code does not need. The same video as youtu.be/ID is under 30 characters, halves the module count and lets you print smaller for the same reliability.',
          'For channels, use the handle URL — youtube.com/@yourhandle — rather than the legacy /channel/UC… id, which is long and impossible for a human to check. The handle is also what people can type when the scan fails.',
        ],
        bullets: [
          'youtu.be/ID: 2 cm prints fine',
          'Full watch URL with parameters: 3.5 cm or more',
          'Channel handle: 2.5 cm',
        ],
      },
      {
        heading: 'Match the destination to the moment',
        paragraphs: [
          'On a shelf label or a product box, link the video that shows the thing working — the demo, the assembly, the recipe. On a poster or a stand, link the channel so a newcomer can choose. Sending a passer-by to a 40-minute stream is how you get one view and no subscription.',
          'Remember that YouTube may show a consent interstitial in some regions before the video plays. A caption like “Scan to watch the 60-second setup” sets the expectation and costs you nothing.',
        ],
      },
      {
        heading: 'The pitfalls worth printing around',
        paragraphs: [
          'Age-restricted and region-blocked videos open to an error page — test the exact video from a logged-out browser. Unlisted videos work only through the link, so the code is the only door, which is fine until you rotate the video.',
          'And a quiet one: several TV apps now open links from phones. If your video is meant for a phone, keep it vertical and short; a 16:9 landscape video on a phone in a shop converts poorly.',
        ],
      },
    ],
    howTo: {
      name: 'How to create a YouTube QR code',
      steps: [
        { name: 'Copy the short link', text: 'Use youtu.be/<id> for a video, or youtube.com/@handle for a channel — never the URL with playlist parameters.' },
        { name: 'Choose YouTube in the studio', text: 'Paste the link and check the preview: the shorter the URL, the sparser the pattern.' },
        { name: 'Size for the reading distance', text: '2 cm on a product label read in the hand, 3 cm or more on a poster or shelf talker.' },
        { name: 'Test from a logged-out browser', text: 'Confirm the video or channel opens without a login wall, and that it is not region-blocked where you are printing.' },
      ],
    },
    faq: [
      {
        q: 'Should the code link to a video or to my channel?',
        a: 'A video when it answers the question the object raises — how it works, how to assemble it, what it tastes like. A channel when the goal is subscribers, or when you cannot know which video matters.',
      },
      {
        q: 'Why does my YouTube code look so dense?',
        a: 'Almost always a full watch URL with tracking parameters. Replace it with the youtu.be short form and the pattern loses roughly half its modules, which makes a much smaller print possible.',
      },
      {
        q: 'Do unlisted videos work?',
        a: 'Yes — anyone with the link can watch, and the code is that link. Just remember that rotating or deleting the video kills every printed copy, so keep it live for as long as the print run lasts.',
      },
      {
        q: 'Does it open the YouTube app?',
        a: 'On phones with the app installed, usually yes; otherwise it opens in the browser. Either way the video plays, and no account is needed unless the video is age-restricted.',
      },
    ],
    related: ['/instagram-qr-code', '/facebook-qr-code', '/app-download-qr-code'],
    updated: UPDATED,
  },

  {
    path: '/telegram-qr-code',
    typeId: 'telegram',
    title: 'Telegram QR Code — Channel or Chat Link | QRForge',
    description:
      'Create a Telegram QR code for a channel, group or bot. Free, no account, print-ready. Learn which t.me links expire and which never do.',
    h1: 'Telegram QR code for a channel, group or bot',
    lede:
      'A Telegram QR code is a t.me link: a username, an invite hash, or a bot with a start parameter. The difference between those three decides whether your printed code still works next year.',
    navLabel: 'Telegram',
    sections: [
      {
        heading: 'Three kinds of t.me link, three lifetimes',
        paragraphs: [
          'A public username — t.me/yourchannel — is permanent while the username exists. An invite link — t.me/+AbCdEf123 — can be revoked, can have a member limit, and dies with the group. A bot link — t.me/yourbot?start=promo — is permanent and can carry a payload your bot reads on first contact.',
          'So for anything printed, prefer a username. Invite hashes are for private groups and temporary campaigns; the moment an admin clicks “revoke link”, every poster in the street becomes decoration.',
        ],
        bullets: [
          'Public channel or group: t.me/username — permanent',
          'Private invite: t.me/+hash — revocable, can expire',
          'Bot: t.me/botname?start=payload — permanent and trackable',
        ],
      },
      {
        heading: 'Size and placement',
        paragraphs: [
          'These links are short, so the code stays sparse: 2–2.5 cm is plenty for a card, a flyer or a sticker. Keep the Telegram blue out of the code itself — a coloured background with dark modules is technically scannable but measurably worse in low light; the scan check will tell you when contrast slips below 4.5:1.',
          'Telegram audiences scan fast and expect a channel, not a website. Put the channel name and what is posted there in the caption: “Daily deals — 2–3 posts a week” is a reason; “Join us on Telegram” is not.',
        ],
      },
      {
        heading: 'The honest caveats',
        paragraphs: [
          'Telegram availability is uneven: it is blocked or restricted in some countries and on some corporate networks. If your audience is mixed, print the username so people can search for it, and consider a WhatsApp code beside it.',
          'Also check membership settings before printing. A group with “request to join” approvals turns a scan into a wait; a channel with comments disabled is fine for announcements but poor for support.',
        ],
      },
    ],
    howTo: {
      name: 'How to create a Telegram QR code',
      steps: [
        { name: 'Decide channel, group or bot', text: 'A public username if the code will be printed; an invite hash only for private, short-lived campaigns.' },
        { name: 'Copy the t.me link', text: 't.me/<username> for public, t.me/+<hash> for invites, t.me/<bot>?start=<payload> for bots.' },
        { name: 'Choose Telegram in the studio', text: 'Paste the link and keep the print at 2–2.5 cm — these URLs are short, so the pattern stays sparse.' },
        { name: 'Test the join flow end to end', text: 'Scan from an account that is not yet a member and confirm no approval step blocks entry.' },
      ],
    },
    faq: [
      {
        q: 'Do Telegram invite links expire?',
        a: 'They can. An admin can revoke an invite, set an expiry date or cap the number of joins. That is why printed material should use a public username whenever possible.',
      },
      {
        q: 'Can a QR code open a Telegram bot with a parameter?',
        a: 'Yes — t.me/yourbot?start=spring2026 tells the bot which code was scanned. It is the cleanest way to attribute a scan without a redirect service.',
      },
      {
        q: 'Why does the link open in a browser?',
        a: 'On a phone without Telegram installed, t.me opens the web preview with an install prompt. That is expected behaviour, and the channel preview is usually readable.',
      },
      {
        q: 'Is Telegram blocked where my customers are?',
        a: 'In some countries and on many corporate networks, yes. Print the username as text and consider a second code for a channel that is definitely reachable in your market.',
      },
    ],
    related: ['/whatsapp-qr-code', '/instagram-qr-code', '/social-qr-code'],
    updated: UPDATED,
  },

  {
    path: '/linkedin-qr-code',
    typeId: 'linkedin',
    title: 'LinkedIn QR Code — Profile by Scan | QRForge',
    description:
      'Create a LinkedIn QR code for your profile — on a CV, a badge or a slide. Free, no account, print-ready. Includes the short custom-URL tip.',
    h1: 'LinkedIn QR code for a CV, badge or slide',
    lede:
      'A LinkedIn QR code opens your profile in the app, which is exactly what a recruiter or a conference contact wants instead of typing your name. Set the custom URL first — it halves the code.',
    navLabel: 'LinkedIn',
    sections: [
      {
        heading: 'Set the custom URL before you print',
        paragraphs: [
          'LinkedIn gives every profile an auto-generated address with a long id and your name. If you have not set a custom public URL, do it first: it looks professional, it is half the length, and it keeps the QR code sparse enough for a 2 cm print on a name badge.',
          'The custom URL lives in the profile’s public-profile settings. Once set, linkedin.com/in/yourname is stable and short enough that people can read it off the code and type it later.',
        ],
      },
      {
        heading: 'Where a LinkedIn code actually works',
        paragraphs: [
          'Conference badges are the classic case: the printed badge carries the code, the person you just met scans it and sends a connection request while you are still talking. It also works on the last slide of a deck, in a CV header, on a portfolio’s contact page, and on a speaker card at an event.',
          'On a CV printed for a recruiter, add the URL as text beside the code — CVs are read on paper in a stack, and a recruiter on a desktop cannot scan anything.',
        ],
        bullets: [
          'Name badge: 2 cm with a custom URL',
          'CV header: 1.8–2 cm, plus the URL in text',
          'Slide or poster: 2.5–3 cm',
        ],
      },
      {
        heading: 'Two details that matter',
        paragraphs: [
          'LinkedIn opens inside its own app when installed, and shows a login wall to logged-out browsers. That is normal, but it means the code is only useful to people who already use LinkedIn — do not put it where the audience is not.',
          'Also decide whether the destination is you or the company. For a hiring stand, a company page code plus your profile code is a stronger pair than a single ambiguous square.',
        ],
      },
    ],
    howTo: {
      name: 'How to create a LinkedIn QR code',
      steps: [
        { name: 'Set a custom public URL', text: 'In LinkedIn’s public profile settings, choose a short handle before generating anything.' },
        { name: 'Copy the profile link', text: 'linkedin.com/in/<handle> — no query parameters from the share menu.' },
        { name: 'Choose LinkedIn in the studio', text: 'Paste the URL and confirm the code preview stays sparse at the print size you need.' },
        { name: 'Scan it before ordering badges', text: 'Check the app opens your profile, and that the URL printed beside it matches.' },
      ],
    },
    faq: [
      {
        q: 'Why does the LinkedIn link show a login page?',
        a: 'LinkedIn requires a session to view profiles in a browser. Scans from people already logged in open the app or the profile directly; logged-out visitors get the sign-in screen, which is expected.',
      },
      {
        q: 'Can I link to my company page instead?',
        a: 'Yes — use the company’s /company/<name> URL. At a hiring stand, printing both the company page and your personal profile works better than one ambiguous code.',
      },
      {
        q: 'Should the code be on a CV?',
        a: 'It can be, in the header, with the URL in text beside it. Recruiters reading on paper or on a desktop cannot scan a printed code, so the text is what does the work there.',
      },
      {
        q: 'Why is my LinkedIn code so dense?',
        a: 'An auto-generated profile URL is long and full of numbers. Set a custom public URL and the payload drops dramatically, which lets you print smaller.',
      },
    ],
    related: ['/vcard-qr-code', '/telegram-qr-code', '/social-qr-code'],
    updated: UPDATED,
  },

  {
    path: '/social-qr-code',
    typeId: 'social',
    title: 'Social QR Code — One Link for All Profiles | QRForge',
    description:
      'Print one QR code that leads to a page with every social profile. Free generator for link-in-bio hubs — no account, no subscription, print-ready.',
    h1: 'Social QR code: one square for every profile',
    lede:
      'A social QR code points at a single hub page that lists all your profiles, so you print one code instead of five — and you can add a new platform without reprinting anything.',
    navLabel: 'Social hub',
    sections: [
      {
        heading: 'Why a hub beats five codes',
        paragraphs: [
          'Five squares on a business card is a design problem, and a person who uses one platform has to find the right one. A hub page — your own page, or a link-in-bio service — gives everyone one action and lets the visitor choose the platform they actually use.',
          'The second benefit is maintenance. Add a TikTok tomorrow and the printed code still works, because the destination did not change. That is the same principle as pointing a menu code at a stable URL: the short link is the product, the code is just the door.',
        ],
      },
      {
        heading: 'Build the hub so it loads fast',
        paragraphs: [
          'A hub page is read on a phone, often on mobile data, after someone has already waited to take a photo of your code. Keep it under a few hundred kilobytes: no hero video, no web-font stack, no cookie banner. A list of big touch targets (44 px minimum) and your name is the whole design.',
          'If you host it yourself, keep the path short — /links — and serve it over https. A long tracking URL adds modules to the code and slows the join.',
        ],
        bullets: [
          'One code, 2.5 cm, on anything printed',
          'Hub page under ~300 kB, first paint under 2 s on 4G',
          'Every link at least 44 × 44 pt for thumbs',
        ],
      },
      {
        heading: 'When the hub is the wrong tool',
        paragraphs: [
          'If the account is the product — a shop on Instagram, a channel on Telegram — send people straight there. An extra tap costs followers, and a hub that lists six dead links reads as neglect.',
          'Also avoid third-party hub services whose free tier disappears. A burned-in short link you do not own can take every printed code with it; a path on your own domain cannot.',
        ],
      },
    ],
    howTo: {
      name: 'How to create a social QR code',
      steps: [
        { name: 'Make the hub page first', text: 'A simple https page listing your profiles with large tap targets — on your own domain if you can.' },
        { name: 'Keep the address short', text: '/links beats a long path, and it makes the printed code sparser and easier to scan.' },
        { name: 'Choose Social Hub in the studio', text: 'Paste the hub URL, check the preview and export at 2.5 cm for cards and packaging.' },
        { name: 'Test every link in the hub', text: 'One dead profile link undoes the whole point — click each one from a phone before printing.' },
      ],
    },
    faq: [
      {
        q: 'What is a link-in-bio page?',
        a: 'A single page that lists all your profiles, usually at a short address. It exists because most platforms allow only one clickable link, and because printing five separate QR codes is impractical.',
      },
      {
        q: 'Can I use a free hub service?',
        a: 'You can, but the printed code then depends on that service staying free and online. A page on your own domain with a short path is the version that cannot be switched off.',
      },
      {
        q: 'Should the code go on a business card?',
        a: 'Yes — one code at 2.5 cm in place of five platform icons. Print the hub address as text too, so the card still works for someone who would rather type.',
      },
      {
        q: 'How many links should the hub list?',
        a: 'Three to six, ordered by what you actually want people to do. A page with fifteen options converts worse than a page with four clear ones.',
      },
    ],
    related: ['/instagram-qr-code', '/vcard-qr-code', '/telegram-qr-code'],
    updated: UPDATED,
  },

  {
    path: '/static-vs-dynamic-qr-code',
    typeId: 'url',
    title: 'Static vs Dynamic QR Codes — Which Do You Need? | QRForge',
    description:
      'The real difference between static and dynamic QR codes: expiry, editing, tracking and cost. A plain-English comparison, with when each one is worth it.',
    h1: 'Static vs dynamic QR codes: what actually differs',
    lede:
      'A static QR code holds the data itself and never expires. A dynamic QR code holds a short link that redirects, so you can change the destination and count scans — but you rent that service for as long as the code lives.',
    navLabel: 'Static vs dynamic',
    sections: [
      {
        heading: 'The technical difference, in one paragraph',
        paragraphs: [
          'In a static code the payload is your URL, phone number or WiFi details, encoded directly into the modules. In a dynamic code the payload is a short link on the provider’s domain, and the provider’s server decides where that link goes and records the hit.',
          'Everything else follows from that one fact. A static code needs nobody’s server to work, so it works forever and cannot be switched off. A dynamic code needs the provider to exist, stay paid and keep the redirect up — and it can be edited, because the content lives on their side, not in the ink.',
        ],
      },
      {
        heading: 'What you get, and what you give up',
        paragraphs: [
          'Dynamic buys three things: editable destinations, scan analytics, and per-code routing (A/B tests, time-based rules, region splits). It costs money, adds a dependency and adds latency — the scan goes to the provider before it reaches your page.',
          'Static buys permanence and privacy: nothing is tracked, nothing expires, nothing breaks when a subscription lapses. It costs you editability — change the URL and you print again — and tracking, of which there is none by design.',
        ],
        bullets: [
          'Menu or business card that will not change: static',
          'Campaign with A/B tests and scan counts: dynamic',
          'Anything printed once and expected to last years: static',
          'Codes on packaging with a dashboard someone checks weekly: dynamic',
        ],
      },
      {
        heading: 'The middle path most projects should take',
        paragraphs: [
          'Point a static code at a short path on a domain you own — /menu, /links, /card — and re-point that path whenever you like with a 301. You keep permanent print, no subscription and full control, and you gain most of the editability that people buy dynamic codes for.',
          'QRForge only makes static codes, and that is deliberate: they never expire and never phone home. If you need scan analytics, self-host the redirect and count it yourself — or accept a dynamic service and its dependency consciously, rather than by accident.',
        ],
      },
    ],
    howTo: {
      name: 'How to choose between static and dynamic',
      steps: [
        { name: 'Ask whether the destination will change', text: 'If the answer is no, or “rarely”, a static code with a path you own is the better deal.' },
        { name: 'Ask who needs the scan counts', text: 'If nobody will read a dashboard weekly, tracking is decoration you are paying for.' },
        { name: 'Own the short link either way', text: 'Use your own domain so the printed code outlives any service — /menu, /links, /card.' },
        { name: 'Print one and test it for a month', text: 'Confirm the destination stays up and the code still scans before committing to a large run.' },
      ],
    },
    faq: [
      {
        q: 'Do static QR codes expire?',
        a: 'No. The data is inside the pattern, so there is nothing to expire, no scan limit and no server that can be switched off. A printed static code works as long as the paper and the destination page do.',
      },
      {
        q: 'Can I edit a static QR code?',
        a: 'Not the code itself. You can change what it points at by using a redirect you control, or you can print a new code. That is the one real trade-off against a dynamic code.',
      },
      {
        q: 'Are dynamic codes more expensive?',
        a: 'Usually yes: they come with a subscription because someone runs the redirect and the analytics. Free dynamic services exist but are exactly the ones most likely to disappear, taking printed codes with them.',
      },
      {
        q: 'Which is more private?',
        a: 'Static. There is no server between the scan and the destination, so no one — including QRForge — can see that a scan happened or from where.',
      },
    ],
    related: ['/url-qr-code', '/menu-qr-code', '/vcard-qr-code'],
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
