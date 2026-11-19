# QRForge — Enterprise Multi-Function QR Code Generator

A premium, **100% client-side** QR code generator with a QR-native "MODULE" interface, built with **React + Vite + TypeScript + TailwindCSS**.
Create branded QR codes for 20+ content types, customize every pixel, and export in 7 formats —
no backend, no sign-up, no watermarks. Deploys free on **GitHub Pages**.

![Stack](https://img.shields.io/badge/React-18-61dafb) ![Vite](https://img.shields.io/badge/Vite-6-646cff) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8) ![License](https://img.shields.io/badge/license-MIT-green)

---

## Live site

- **Source code:** https://github.com/ronyopq/QR-Code-Generator — the app's GitHub icon (top bar),
  the left rail, the footer **source** link, the credits sheet and `⌘K → Source on GitHub`
  all point here (`src/data/repo.ts` is the single place to change it).
- **Canonical site:** https://qrforge-bd.vercel.app — every `canonical`, `og:url` and sitemap
  entry points here. The old `qrforge-gamma-five.vercel.app` alias 308-redirects to it
  (`vercel.json`), and the GitHub Pages copy defers to it through `rel="canonical"`.
- **GitHub Pages:** https://ronyopq.github.io/QR-Code-Generator/ — the workflow
  (`.github/workflows/deploy.yml`) is ready; a repository admin only needs to set
  **Settings → Pages → Source: GitHub Actions** once. Until then the workflow builds,
  keeps the artifact and skips publishing with a notice (it does not fail).

Both sites build from the same commit with `npm run build` (Vite, `dist/`).

The version in the footer comes from `package.json` (`__APP_VERSION__`, injected by `vite.config.ts`),
so the number you see in the app is the number in [CHANGELOG.md](./CHANGELOG.md).


## 🗺️ Roadmap

What is worth building next — reliability gaps, scan-safety checks, PWA polish, tests and CI — is
listed with evidence, effort and a sprint plan in **[ROADMAP.md](./ROADMAP.md)**.

## ✨ Features

### 19 QR types
URL · Text · Email · Phone · SMS · WhatsApp · WiFi · vCard · Location · Event/Calendar ·
Social Hub · Facebook · Instagram · YouTube · Telegram · LinkedIn · PDF Link · App Download ·
Restaurant Menu — each with a smart, type-specific form and sample data.

There is no "dynamic QR" type: a static code cannot report scans, and a type that says otherwise
is a promise, not a feature. See [Why there is no dynamic QR](#why-there-is-no-dynamic-qr-and-no-scan-analytics).

### Developer showcase
The footer, the desktop icon rail and the mobile drawer carry a **Crafted by Rony Siddiqi**
badge. It opens a profile sheet (bottom sheet on phones, centred modal on desktop) with the
verified role, a short bio, focus areas, skill tags, and cards for Facebook, WhatsApp, Telegram,
LinkedIn, X, Blogger and WordPress — each with its brand mark, a direct link and a one-click
**copy** button. The WhatsApp card hands over a support message with your **browser, OS, device
type, screen size, language, timezone and current page** pre-filled, and the built-in **vCard QR**
saves the contact to a phone camera. The sheet is reachable from `⌘K → Developer profile` and from
Credits → *Meet the developer*. All links live in `src/data/developer.ts`.

### Tall content stays usable
Modals are capped at `calc(100dvh - padding)` with a sticky header/footer and a scrollable body,
so the credits list no longer runs off screen — on a 320 px tall viewport it scrolls instead of
clipping.

Preset swatches are **real renders**: each chip is drawn by the same qr-code-styling engine with the
preset's own options, so gradients, module shapes, eyes and transparent backgrounds match the result
exactly. The active preset is matched field-by-field against only the values the preset defines — a
transparent preset is not rejected because the hidden solid colour drifted, and a dual-colour preset
still needs both colours. Changing anything the preset owns (colour, modules, background) flips the
panel to **custom**; changing margin, size, logo or error correction keeps it selected.

### Preview and download always agree
The live preview is a single `QRCodeStyling` instance that is **updated** in place, and `update()` deep-merges the
new options over the old ones (its `mergeDeep` skips `undefined` values). Any key that a call omits therefore keeps
its previous value — which is why switching from a gradient preset (Ocean, Sunset, Forest, Gold) to a flat one
(Classic, Pastel, Midnight) used to keep painting the old gradient in the preview while the downloaded file, built
from a fresh instance, was correct. `toStylingOptions()` now writes every conditional key on every call
(`color`/`gradient` on dots, corner squares and corner dots, the background colour and gradient, and `image`), using
`undefined` when it is unused, so a merged instance is byte-for-byte identical to a freshly created one. All 100
ordered preset switches are checked against a fresh render.

### Export transparency
PNG, WEBP and SVG keep a transparent background. JPEG has no alpha channel, so JPG / PDF / EPS / the
ZIP bundle composite transparent presets onto **white** instead of encoding them as a black box.

### Start simple, style later
The first code is always **plain black on white** — square modules, safe error correction, generous
quiet zone. Nothing is styled until the user asks for it, so the very first download is guaranteed
to scan. **10 one-click design presets** (Classic · Minimal · Soft · Ocean · Sunset · Forest ·
Midnight · Gold · Neon · Pastel) sit right above the manual controls, and presets never touch the
content — only the look.

Friendly touches: empty-payload placeholder instead of a fake QR, downloads disabled until content
exists, required-field warnings, a "reset to Classic" action, step check-marks as each stage is
completed, and a one-click PNG button next to the preview.

### Customization
- **Body styles:** Square, Rounded, Dots, Classy, Extra Rounded, Star/Diamond (classy-rounded)
- **Eye styles:** Square, Circle, Leaf/Rounded
- **Colors:** Single, Dual, Linear Gradient, Multi Gradient (3-stop), Radial Gradient + presets
- **Background:** Transparent, Solid, Gradient, Pattern (print-safe tint)
- **Logo:** Upload, center, resize (10–50%), padding, remove — with error-correction guidance (use H for logos)
- **Size:** 100–5000 px width/height, scale slider, margin/quiet-zone, error correction L/M/Q/H
- **Quality:** HD, 2K, 4K, Print (300 DPI), Social Media

### Built to be found — SEO and AI visibility
The app is a single-page React bundle, which normally means crawlers see an empty `<div>`.
QRForge ships a **prerendered shell** instead (see [SEO.md](./SEO.md)):

- `scripts/prerender.mjs` renders `src/marketing/StaticShell.tsx` to HTML at build time and injects
  it into `#root` — so Google, Bing, **GPTBot, ClaudeBot, PerplexityBot** and every social scraper
  read the headline, all 19 types, the feature list, the four-step how-to and the full FAQ
  without executing a line of JavaScript. React clears the shell and paints the studio on boot.
- **One JSON-LD `@graph`** (WebSite · Organization · Person · SoftwareApplication · FAQPage ·
  HowTo) generated from `src/marketing/content.ts`, so the machine-readable copy can never drift
  from the visible copy. Absolute URLs only; no fake ratings, no invented reviews.
- `robots.txt` and `sitemap.xml` are **generated** with absolute URLs, and the AI answer engines
  are explicitly allowed. `llms.txt` gives assistants one plain-text source of truth.
- **Twenty static guides** — one real URL per QR type (`/wifi-qr-code`, `/vcard-qr-code`,
  `/menu-qr-code`, `/email-qr-code`, `/instagram-qr-code`, …) plus
  `/static-vs-dynamic-qr-code`. No JavaScript bundle, each with its own title, canonical, OG card
  (containing a real QR of that page), breadcrumb, how-to and FAQ schema.
- **Four how-to guides** — `/how-to/size-a-qr-code`, `/how-to/qr-code-with-logo`,
  `/how-to/qr-not-scanning`, `/how-to/print-qr-codes` — the print questions that decide whether a
  code scans, with numbers instead of advice.
  Adding a page is one entry in `src/marketing/routes.ts`: the build writes the HTML, the sitemap
  and `llms.txt` from it.
- A real **1200×630 social card** (`public/og.png`) with a working QR in it, built by
  `scripts/og-image.mjs` from the same canonical URL — plus one per landing page.
- The build **fails** if the `<title>` grows past 60 characters, if the shell loses its `<h1>` or
  FAQ, or if the JSON-LD stops parsing — SEO regressions break CI, not rankings.

### One language, on purpose
The interface is **English only** — no language switcher, no half-translated strings. A Bengali
UI was tried in 1.3.0 and withdrawn in 1.4.0; it will only come back as a complete, reviewed
translation rather than a partially translated shell.

### Live preview & export
- Real-time generation, zoom (40–250%), fullscreen preview, encoded-payload inspector
- **PNG, JPG, SVG, WEBP, PDF (A4), EPS, A4 print sheet, ZIP package** (PNG+SVG+JPG+payload+config.json)
- Powered by `qr-code-styling`, `jsPDF`, `JSZip`, `FileSaver.js` — loaded only when you export

### Scan check — "will this actually scan?"
The panel under the preview audits the current design before you print:
- **contrast ratio** (WCAG maths) between the real module colour and the real background —
  gradients are averaged, transparent backgrounds are measured against white
- **symbol size**: QR version and module count calculated from the payload bytes and the
  error-correction level, then converted into millimetres for a chosen print width
  (20/30/40/60/100 mm or any value)
- **quiet zone** measured in modules against the true module size
- logo vs. error-correction warnings, inverted (light-on-dark) warnings, cramped-render warnings
- every issue carries a **one-tap fix** (`use error correction H`, `set margin to 4 modules`, …)
- **Test this code**: renders the QR and decodes it with the browser's `BarcodeDetector`,
  confirming the bytes come back identical (Chrome, Edge, Android; the button hides itself
  where the API is unavailable and the static checks still apply)

### A4 print sheet
`Export → A4 SHEET` produces a print-ready PDF: **six copies per page**, dashed cut guides,
labelled cells, correct millimetre sizing, and transparent designs flattened onto white.

### Bulk generator
CSV upload → batch generation with progress bar → single ZIP download.
Headers map to form fields (`url`, `name,phone,email`, `ssid,password`, …). See in-app examples.

### History, favorites & templates
- LocalStorage history (100 items): re-edit, delete, favorite, search
- 7 one-click templates: Business Card, Restaurant Menu, Product Label, Event Ticket, Social Profile, Website Promotion, WiFi Sharing

### Analytics-ready architecture
Local scan counter, device breakdown, date filters (7d/30d/all), per-QR scan ranking.
**Dynamic QR roadmap:** point Dynamic QRs at `https://your-redirect.example/r/:id`, log
`{time, UA, IP→city}` server-side, and read the same `qrforge-scans` schema — the UI is already built.

### Live presence & retention
- **"People online" indicator** in the header and sidebar — pulsing live dot, exact tab count for this device,
  and a click-to-open breakdown with refresh age
- **Toast notification system** — success / error / info / bookmark variants, stacking, auto-dismiss with
  progress bar, optional actions (e.g. "Open history"), fully `aria-live`
- **Modal system** — focus-trapped dialogs, Escape to close, backdrop blur, body scroll lock
- **Bookmark flow** — quiet floating card, `Ctrl/⌘ + D` interception with per-browser instructions,
  copy-link fallback, "install as app" shortcut, and a 4-day dismissal memory so it never nags

### Design, PWA & SEO
- "MODULE" interface: dark-OLED first with a paper light mode, mono typography, 16px module grid, hairline borders, single green accent, icon rail + ⌘K command palette
- **PWA:** installable (`manifest.webmanifest`), and a service worker that precaches the whole app —
  shell, hashed JS/CSS and all self-hosted fonts — so the **first** offline launch works, not the
  second. The install prompt is captured (`beforeinstallprompt`), hides itself once the app runs
  standalone, and confirms with a toast on `appinstalled`.
- **SEO:** meta description, Open Graph, Twitter Cards, JSON-LD structured data, `robots.txt`, `sitemap.xml`
- **Performance:** code-splitting (`vendor` / `qr` / `exporters` chunks), lazy-friendly structure, `prefers-reduced-motion` support, AA-friendly contrast & labels

---

## 🚀 Quick start

```bash
npm ci             # install exactly what the lockfile pins
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build → dist/
npm run preview    # preview the production build
npm test           # unit + DOM tests (Vitest, 37 specs)
npm run typecheck  # types only
```

Requires Node 18+ (tested on Node 22). Every push to a branch runs
`.github/workflows/ci.yml` — typecheck, tests, build — and the deploy workflow only
publishes from `main`.

### What the tests cover

`src/lib/qr.test.ts` builds the payload for **every QR type**, checks the CSV parser and the
full `toStylingOptions` mapping, and pins the **preview/export parity** rule: all 100 ordered
preset switches must resolve to the same options object as a fresh render.
`src/data/stylePresets.test.ts` pins what counts as a deviation from a preset.
`src/components/App.test.tsx` renders the real app in JSDOM and clicks through the presets.
See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for the rules of the build.

---

## 📦 Deploy to GitHub Pages (2 minutes)

**Option A — GitHub Actions (included, recommended)**

1. Push this repo to GitHub (branch `main`).
2. In GitHub: **Settings → Pages → Source: GitHub Actions**.
3. Push to `main` (or run the workflow manually). The included
   [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and deploys automatically.
4. Your app is live at `https://<username>.github.io/<repo>/`.

**Option B — Manual**

```bash
npm run build
# upload the dist/ folder with any static host (Netlify, Vercel, Cloudflare Pages…)
```

> `vite.config.ts` uses `base: './'` so assets resolve correctly under a repo sub-path.
> Update the canonical/OG URLs in `index.html` to your final domain after deploying.

---

## 🗂 Project structure

```
.
├── .github/workflows/deploy.yml   # GitHub Pages CI/CD
├── public/
│   ├── favicon.svg  icons/        # PWA icons (192/512)
│   ├── manifest.webmanifest       # PWA manifest
│   ├── sw.js                      # Offline service worker
│   ├── robots.txt  sitemap.xml    # SEO
│   ├── 404.html  .nojekyll        # GitHub Pages helpers
├── src/
│   ├── App.tsx                    # Sidebar dashboard shell + routing (views)
│   ├── types.ts                   # QRConfig, HistoryItem, defaults
│   ├── data/
│   │   ├── qrTypes.ts             # 19 QR type definitions + fields + samples
│   │   └── templates.ts           # 7 template presets
│   ├── lib/
│   │   ├── qr.ts                  # Payload builders, styling options, CSV parser
│   │   ├── exporter.ts            # PNG/JPG/SVG/WEBP/PDF/EPS/ZIP export engine
│   │   ├── storage.ts             # LocalStorage history + scan log
│   │   ├── presence.ts            # Live online indicator + cross-tab presence
│   │   ├── bookmark.ts            # Visits, dismissal memory, copy link
│   │   └── palette.ts             # Logo → brand palette (colord)
│   └── components/
│       ├── QRPreview.tsx          # Live preview, zoom, fullscreen
│       ├── TypeForm.tsx           # Dynamic per-type form
│       ├── Customizer.tsx         # Style, colors, logo, size controls
│       ├── DownloadPanel.tsx      # Export format picker
│       ├── BulkGenerator.tsx      # CSV → ZIP batch generation
│       ├── HistoryPanel.tsx       # History / favorites / re-edit
│       ├── TemplateLibrary.tsx    # Template grid
│       ├── AnalyticsPanel.tsx     # Scans, devices, date filters
│       ├── Toast.tsx              # ToastProvider + useToast
│       ├── Modal.tsx              # Accessible dialog (focus trap, Esc)
│       ├── OnlineNow.tsx          # Live presence pill + popover
│       ├── BookmarkPrompt.tsx     # Floating card + bookmark dialog
│       ├── CommandPalette.tsx     # ⌘K palette (cmdk)
│       ├── CreditsModal.tsx       # Open-source credits + licences
│       ├── ModuleGlyph.tsx        # Decorative QR module SVG
│       ├── ui.tsx                 # Panel / SectionHead / Field primitives
│       └── ErrorBoundary.tsx      # Never show a blank page
├── index.html                     # SEO / OG / Twitter / JSON-LD
├── vite.config.ts                 # base './', code-splitting
└── tailwind.config.js
```

---

## 🧩 How payloads work

Every QR type compiles to a standard payload in `src/lib/qr.ts` (`buildPayload`):

| Type | Payload example |
|---|---|
| URL | `https://example.com` |
| WiFi | `WIFI:T:WPA;S:MyWiFi;P:secret;;` |
| vCard | `BEGIN:VCARD … END:VCARD` |
| WhatsApp | `https://wa.me/8801…?text=Hello` |
| Event | `BEGIN:VEVENT … END:VEVENT` (.ics) |
| Location | `geo:23.81,90.41` or Google Maps URL |

Styling is translated to `qr-code-styling` options in `toStylingOptions` — swap the renderer
without touching the UI.

---

## 🎨 Design system — "MODULE"

A quiet, premium interface built on **one CSS-variable theme** (no duplicated `dark:`/`light:`
overrides), so both colour schemes resolve completely by construction.

| Token | Light | Dark |
|---|---|---|
| `--c-canvas` | `#f7f7f4` paper | `#08090c` OLED |
| `--c-surface` / `--c-elevated` / `--c-inset` | white / `#fcfcfa` / `#f3f3ef` | `#0f1115` / `#15181e` / `#1b1f27` |
| `--c-line` / `--c-line-strong` | `#e5e5df` / `#cfd0c9` | `#272d38` / `#3a424f` |
| `--c-fg` / `--c-muted` / `--c-subtle` | `#111418` / `#58606a` / `#7a828c` | `#f5f7fa` / `#9ea7b2` / `#828b97` |
| `--c-accent` / `--c-accent-strong` | `#4f46e5` / `#4338ca` | `#818cf8` / `#a5b4fc` |
| `--c-btn-bg` / `--c-btn-fg` | ink `#111418` / white | white / ink |

All of these are exposed to Tailwind as `bg-canvas`, `bg-surface`, `text-fg`, `text-muted`,
`border-line`, `text-accent-strong`, … so a component never needs a mode-specific class.

**Type:** IBM Plex Sans for UI and headings (sentence case, tight tracking) · JetBrains Mono for
micro-labels, indices, numbers and keyboard hints. Both self-hosted via Fontsource.

**Signature details:** a 16px `module-grid` (QR geometry) behind the hero and cards, a 21×21
`ModuleGlyph` with real finder patterns and a scan line, crosshair ticks on the spec card, and a
slim icon rail. Direction informed by the open-source UI/UX Pro Max design skill.

### Accessibility & motion
- Contrast-verified tokens (muted text ≥ 4.5:1 on its surface), visible `:focus-visible` rings
- Lucide SVG icons only, `aria-label`s on icon-only controls, 44px-ish touch targets
- Toasts/modals announce via `aria-live`, trap focus, close on `Escape`
- Framer Motion transitions are disabled under `prefers-reduced-motion`

## 🧰 Free tools used (with credit)

QRForge runs entirely on free, open-source software — every project keeps its own licence and is
credited in-app (**✦ Credits & open source** in the header, or any chip in the footer):

| Project | Role | Licence |
|---|---|---|
| [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) | Styled QR rendering | MIT |
| [React](https://react.dev) + [Vite](https://vite.dev) + [TypeScript](https://www.typescriptlang.org) | App runtime & build | MIT / Apache-2.0 |
| [Tailwind CSS](https://tailwindcss.com) | Design tokens | MIT |
| [Lucide](https://lucide.dev) | All icons | ISC |
| [Framer Motion](https://motion.dev) | Transitions | MIT |
| [cmdk](https://cmdk.paco.me) | Command palette | MIT |
| [colord](https://github.com/omgovich/colord) | Logo colour extraction & contrast maths | MIT |
| [jsPDF](https://github.com/parallax/jsPDF) · [JSZip](https://github.com/Stuk/jszip) · [FileSaver.js](https://github.com/eligrey/FileSaver.js) · [html2canvas](https://github.com/niklasvh/html2canvas) | Export pipeline | MIT |
| [Fontsource](https://fontsource.org) + JetBrains Mono + IBM Plex Sans | Self-hosted fonts (offline) | MIT / OFL-1.1 |
| [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Design-intelligence rules used for the visual system | MIT |

### Auto brand palette
`src/lib/palette.ts` reads an uploaded logo on a canvas, quantises the pixels (skipping
transparent/white/black/grey), and derives a two-colour palette — press **“Match my logo palette”**
in the Style panel to apply it as a gradient.

## 📡 Live online counter## 📡 Live online counter

`src/lib/presence.ts` draws a stable presence number from a traffic curve (peaks ~14:00 UTC,
quieter overnight + weekends) with a 15-second deterministic jitter, so every tab agrees.
Your own open tabs are counted exactly through `BroadcastChannel`. Because the app has **no
backend**, the number is labelled as an estimate in the UI.

To wire real presence, replace `estimateOnline()` with a single fetch — the rest of the UI is unchanged:

```ts
// e.g. Supabase Realtime presence
const channel = supabase.channel('qrforge-online', { config: { presence: { key: tabId } } })
channel.on('presence', { event: 'sync' }, () => setOnline(Object.keys(channel.presenceState()).length))
channel.subscribe(async (status) => { if (status === 'SUBSCRIBED') await channel.track({ joined: Date.now() }) })
```

Any endpoint returning `{ online: number }` also drops straight in.

## 🔖 Retention (bookmark / install)

`src/lib/bookmark.ts` counts sessions (one per browser session), then:
1. after a second visit shows a small non-blocking card, or
2. opens the bookmark dialog on `Ctrl/⌘ + D` (intercepted, so the user sees the right steps), or
3. opens it from "Save this app" in the sidebar / footer / welcome toast.

The dialog offers the keyboard shortcut, a copy-link fallback and an install-as-app action.
Dismissals are remembered for 4 days so the prompt stays polite.

## 🔒 Privacy

Everything runs in the browser. History, scans, and settings live in `localStorage`
(`qrforge-history-v1`, `qrforge-scans-v1`). Nothing is uploaded anywhere.

### Why there is no dynamic QR (and no scan analytics)

A static QR code cannot report that it was scanned — the data is inside the pattern and no server
is involved. Getting scan counts means putting a short link and a redirect service between the
print and the destination: a backend, an account, a bill, and a code that stops working when the
service does. That is not this product. QRForge stays static so a printed code works as long as the
paper and the destination page do. If you need editable destinations or scan counts, the honest
route is a short path on a domain you own plus a 301 — see
[/static-vs-dynamic-qr-code](https://qrforge-bd.vercel.app/static-vs-dynamic-qr-code).

## ♿ Accessibility

Guaranteed by `src/design.test.ts`, which recomputes the numbers from `src/index.css` on every run:

- **Contrast** — every text token clears WCAG AA (4.5:1) on the surfaces it is used on, in both themes.
- **Focus** — solid accent ring (5.86:1 light, 6.67:1 dark) against the 3:1 that WCAG 1.4.11 asks
  for; `forced-colors` gets a real outline instead, because high contrast ignores box-shadows.
- **Targets** — chips and icon buttons keep their size but carry an invisible 44×44 hit area.
- **Keyboard** — a skip link jumps the type rail; dialogs trap focus, restore it on close and close
  on Escape.
- **Motion** — `prefers-reduced-motion` disables animation and transitions.

## 📄 License

MIT — free for personal and commercial use. See [LICENSE](./LICENSE).
Security reports: [SECURITY.md](./SECURITY.md).

### Troubleshooting styles
The stylesheet is linked from `index.html` (`<link rel="stylesheet" href="./src/index.css">`)
rather than imported from JS, so it applies even before React boots and survives dev
hot-reloads. If a browser ever shows the app unstyled, a `StylesGuard` component detects the
unpainted page (transparent `body` **and** a missing `--c-canvas` token) and offers a reload
instead of failing silently. The footer prints a `build <timestamp>` stamp — if it is missing,
the tab is running cached code.
