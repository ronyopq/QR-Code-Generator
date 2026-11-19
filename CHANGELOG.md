# Changelog

All notable changes to QRForge are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.10.0] — 2026-11-19

### Fixed
- **Offline worked only from the second visit.** The service worker cached the shell and the icons,
  but the hashed JS/CSS/font files were only cached *after* a page fetched them — so the first
  launch after installing, with no network, showed an unstyled blank page. `scripts/prerender.mjs`
  now reads the built `index.html` and stylesheet and injects this build's hashed assets (entry,
  chunks, CSS and the 11 self-hosted woff2 files — 260 kB) into `public/sw.js`'s `PRECACHE` list at
  build time. The build fails if the placeholder disappears or nothing is injected.
  `CACHE_VERSION` goes to `qrforge-v4`, so existing installs re-cache once.
- **Range sliders were 4 px tall.** A 4 px track with a 14 px thumb is a desktop-only target — on a
  phone you cannot reliably grab it. The input is now 44 px tall with the same 4 px track drawn by
  `::-webkit-slider-runnable-track` / `::-moz-range-track`, so the look is unchanged and the touch
  target quadruples. Firefox gets its own `::-moz-range-thumb` styling for the first time.

### Added
- **Install prompt handling that reacts.** `appinstalled` is now listened to: the button disappears,
  and a toast confirms the app opens offline from now on. When the page is already running as an
  installed app (`display-mode: standalone`), the install button is not rendered at all instead of
  offering an install the browser will refuse.

### Changed
- Two more design guards (`src/design.test.ts`, now 12 tests): sliders must keep the 44 px/4 px
  split, and `public/sw.js` must keep its `PRECACHE` placeholder and version constant.

## [1.9.0] — 2026-11-19

### Removed
- **The "Dynamic QR (Ready)" type.** It was one of the twenty tiles on the format rail, and it
  promised a backend that has now been ruled out: all it did was append `utm_source=qrforge-dynamic`
  to a URL. A type called "Ready" that is never going to be ready is the exact kind of claim this
  project keeps removing. 19 types remain, and a test now fails if any label says *dynamic*,
  *ready*, *soon*, *beta* or *coming*.

### Fixed
- **Contrast in the light theme.** `--c-subtle` measured 3.62:1 on the canvas and 3.89:1 on a card —
  below WCAG AA, and it was the colour of every 9.5px mono label in the UI. It is now 5.01:1 /
  5.38:1 / 4.84:1 on canvas / surface / inset.
- **The focus ring was too faint.** `ring-accent/60` resolves to 2.71:1 against the light canvas;
  WCAG 1.4.11 asks for 3:1. It is solid accent now — 5.86:1 light, 6.67:1 dark. Text inputs were
  worse: `.input` overrode the ring with `accent/15` (~1.2:1), so keyboard users saw almost nothing.
  They now use the same solid ring as everything else, plus a solid accent border.
- **Small controls had small targets.** Chips and icon buttons keep their exact look, but carry an
  invisible, centred 44×44 hit area (`.tap-44`), and sidebar rows are at least 44px tall.

### Added
- A **skip link** that jumps the 19-type rail and the top bar, with the main region made focusable.
- A `forced-colors` fallback: Windows high contrast ignores box-shadow rings, so focus draws a real
  outline there.
- `src/design.test.ts` — 10 guards that recompute the WCAG ratios from `index.css`, check the focus
  and target rules exist, forbid raw hex colours in class names, and keep every product claim
  honest (type count, no "ready"/"dynamic" labels, no invented types).

### Changed
- Type counts are **derived from the data**: the page title, meta description, summary, feature
  list and how-to step all read `QR_TYPES.length` (via `TYPE_COUNT`), so copy can no longer drift
  from the app.
- The summary and the feature list used to name types that do not exist (*X, crypto, payment*) and
  the manifest called the app "Enterprise". Both are now built from `QR_TYPES` / corrected.

## [1.8.1] — 2026-11-19

### Changed
- **Dynamic QR is cancelled** (decision, 19 Nov 2026). The Supabase short-link + redirect +
  scan-analytics plan is removed from the roadmap, not postponed: the feature only works by
  putting a server between the print and the destination, which contradicts what the site
  promises — nothing uploaded, no account, codes that never expire. README now says so under
  Privacy, and `SEO.md` records why the comparison page keeps owning those queries instead.

## [1.8.0] — 2026-11-19

### Added
- **Four how-to guides**, one per question people actually type before buying anything:
  `/how-to/size-a-qr-code` (how big should a QR code be — the 10:1 distance rule, a print-size
  table, module math), `/how-to/qr-code-with-logo` (why level H makes a logo safe and where you
  must never draw), `/how-to/qr-not-scanning` (eight faults, ordered most to least likely) and
  `/how-to/print-qr-codes` (vector in, 300 dpi floor, pure K black, test one copy).
- A **How-to** section on the home shell and a matching row in the FAQ card, separate from the
  by-type guide list.

### Changed
- Landing pages are no longer assumed to sit one directory deep. `rel()`, `studioHref()`,
  `renderDocument()` and the build's asset guard now count path segments, so a nested
  `/how-to/<slug>/` links `../../assets/…`, `../../favicon.svg` and `../../manifest.webmanifest`
  and still works on both the Vercel root and a GitHub Pages subpath.
- Pages that are not a payload type may now omit `typeId`: their CTA opens the studio without
  preselecting a type (a printing guide is not "the PDF type").
- Every page has an explicit **ctaLabel**, so CTAs read "Make an SMS QR code" instead of
  "Make your sms now" — and the comparison page no longer says "Make your static vs dynamic now".
- 25 URLs in `sitemap.xml` and `llms.txt`; 25 OG cards.

## [1.7.0] — 2026-11-19

### Added
- **Fifteen more landing pages** — the site now covers every type it offers:
  `/email-`, `/phone-`, `/sms-`, `/text-`, `/location-`, `/event-`, `/pdf-`,
  `/app-download-`, `/instagram-`, `/facebook-`, `/youtube-`, `/telegram-`, `/linkedin-`,
  `/social-qr-code` plus `/static-vs-dynamic-qr-code`. Still static HTML + CSS only, still one URL
  per intent, still 350–700 words written for that specific question.
- `/static-vs-dynamic-qr-code` replaces the tempting `/dynamic-qr-code`: QRForge only makes static
  codes, so a "dynamic generator" page would promise something the product does not do. The honest
  comparison ranks for the same query and explains the middle path (own the short link).
- `scripts/og-image.mjs` now reads the route table through esbuild and generates **one card per
  page** (21 files), with auto-fitting titles, subtitles, fact lines and URLs — so a new page gets
  a correct card for free. Long titles fall back to two balanced lines; nothing can slide under
  the QR panel.

### Changed
- The in-app "Guides by type" row lists all 20 pages (`src/marketing/guides.ts`), and the crawlable
  shell's guide grid grew from 5 to 20 entries. A test keeps both in sync with `routes.ts`.
- 21 URLs in `sitemap.xml`, 21 entries in `llms.txt`.

## [1.6.0] — 2026-11-19

### Added
- **Five static landing pages** — `/wifi-qr-code`, `/vcard-qr-code`, `/menu-qr-code`,
  `/whatsapp-qr-code`, `/url-qr-code`. Each is a real URL with its own `<title>`, description,
  canonical, 1200×630 OG card, breadcrumb, type-specific `<h1>`, 400–700 words of copy, a
  four-step how-to and four FAQs. They ship with **no JavaScript bundle at all** (CSS + HTML
  only), so they load in one round trip on any phone.
- `src/marketing/routes.ts` — the single route table. The build renders a page per entry, adds it
  to `sitemap.xml` and lists it in `llms.txt`; nothing else needs editing.
- `src/marketing/LandingPage.tsx`, `Chrome.tsx` (shared header/footer/CTA) and `document.ts`
  (complete document with absolute canonical/OG and `../assets/…` links that work on both the
  Vercel root and a GitHub Pages subpath).
- Per-page structured data: `WebPage` + `BreadcrumbList` + `HowTo` + `FAQPage`, cross-referenced
  to the home graph by absolute `@id`.
- `public/og/<page>.png` — five more social cards, each carrying a **real QR of that page**.
  `scripts/og-image.mjs` now auto-fits long titles (two lines at 96 px instead of one at 60 px).
- **`?type=` deep links** (`src/lib/deepLink.ts`) — every landing page's CTA opens the studio with
  that format preselected. Unknown or missing values safely fall back to the default config.
- Home page now links to the guides: a "Guides by QR code type" section in the crawlable shell and
  a compact link row in the app, so internal linking survives hydration.
- 20 new tests (94 total): route-table integrity, SERP-length limits, ≥350 words per page, unique
  titles/H1s, valid cross-links, `GUIDES` ↔ `LANDING_ROUTES` sync, sitemap coverage, per-page
  document shape, no-JS guarantee, HTML escaping and JSON-LD escaping.

### Changed
- Canonical URLs are slash-free (`/wifi-qr-code`) to match `trailingSlash: false` on Vercel, so a
  canonical never redirects to a different URL.
- The static shell's header/footer now come from the shared `Chrome` components, so the home page
  and the landing pages can never drift apart visually.

## [1.5.0] — 2026-11-19

### Added
- **Crawlable static shell.** `src/marketing/StaticShell.tsx` is rendered to HTML at build time and
  injected into `#root`, so search engines and AI answer engines that never run JavaScript still
  read the headline, all 20 types, the feature list, the how-to and the FAQ. React clears the
  shell and paints the studio on boot (`src/main.tsx`).
- **One JSON-LD `@graph`** — WebSite, Organization, Person (Rony Siddiqi with every real profile as
  `sameAs`), SoftwareApplication (free, MIT, versioned from `package.json`, feature list, repo),
  FAQPage and HowTo — all generated from `src/marketing/content.ts`.
- **Generated `robots.txt`, `sitemap.xml` and `llms.txt`** with absolute URLs, and explicit
  `Allow` rules for GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, PerplexityBot,
  Google-Extended, Applebot-Extended, CCBot and Bingbot.
- **Real 1200×630 social card** (`public/og.png`) containing a scannable QR, built by
  `scripts/og-image.mjs` (ImageMagick + the project's own QR library — no canvas, no headless
  browser, works in CI).
- `vercel.json`: canonical-host 308 redirect from the old alias, immutable asset caching,
  `must-revalidate` for `index.html` and `sw.js`, plus HSTS / `nosniff` / `Referrer-Policy` /
  `Permissions-Policy` headers.
- **In-app FAQ + how-to** (`src/components/FaqSection.tsx`) at the bottom of the studio, rendering the
  same `content.ts` copy — so the FAQPage/HowTo schema describes content a visitor can actually read
  on the rendered page, not only in the static HTML.
- 15 SEO tests: title and description lengths, absolute-URL rules, graph shape, FAQ parity,
  creator `sameAs`, script-tag escaping, and the shell's `<h1>`/type/FAQ coverage.

### Changed
- **Canonical host is `https://qrforge-bd.vercel.app`** — `canonical`, `og:url`, `og:image`,
  sitemap, JSON-LD and `developer.ts` all agree. `qrforge.vercel.app` and
  `qrforge-app.vercel.app` belong to other Vercel projects (409 Conflict), so they are not used.
- `<title>` trimmed from 84 to 53 characters and the description to 155, so nothing is truncated
  in a SERP; `og:image` is absolute and correctly sized; `og:site_name`, `og:locale`,
  `twitter:site`/`creator` and image dimensions added.
- `npm run build` now ends with `node scripts/prerender.mjs`; `npm run seo` reruns it alone.
  The step fails the build on title overflow, an empty shell or invalid JSON-LD.
- `manifest.webmanifest` no longer claims "20 formats, 7 export types" — it says 20 types, 8 formats.

## [1.4.0] — 2026-11-19

### Removed
- **Bengali interface and the language switcher — withdrawn.** The i18n layer from 1.3.0
  (`src/lib/i18n.tsx`, its dictionary and its tests) is gone, and every component renders plain
  English strings again. Reason: the translation shipped ahead of a full review and left the
  type forms and the customiser in English, so the switcher promised more than it delivered.
- `qrforge-lang` localStorage key is no longer written or read; a leftover value is harmless.

### Changed
- The version fix from 1.3.0 survives: `__APP_VERSION__` still comes from `package.json`, and the
  scan-check fixes carry a plain `label` instead of a dictionary key.
- Tests: the Bengali DOM test and the dictionary suite were replaced by a guard that fails if the
  interface ever renders Bengali text or exposes a language switch again (59 specs total).

### Fixed
- `<html lang="en">` is now the single source of truth, so screen readers and search engines no
  longer follow a stale per-device preference.

## [1.3.0] — 2026-11-19

### Added
- ~~**Bengali interface.**~~ *Withdrawn in 1.4.0.* A zero-dependency i18n layer (`src/lib/i18n.tsx`) with a flat
  dictionary, `{placeholder}` interpolation and an English fallback for every missing key.
  The header gains a language switch (icon-only on phones); `<html lang>` and the saved
  preference follow it. Translated: navigation, hero, section headings, preset names and
  descriptions, preview panel, export panel, the whole scan-check report (issues and their
  one-tap fixes), toasts and the footer.
- Tests: dictionary parity (no missing or empty Bengali key, no untranslated leftovers),
  interpolation, fallback, every issue code + fix key, and a DOM test that flips the app to
  Bengali and back.
- `__APP_VERSION__` build constant, injected from `package.json`.

### Fixed
- The footer and the share text hardcoded `v1.0` — they now show the real version.
- Footer counted *types* as "formats"; the hero said "20 formats / 7 export types". Both now
  read 20 types and 8 export formats (the A4 sheet included).

## [1.2.0] — 2026-11-19

### Added
- **Scan check panel**: contrast ratio, QR version/module count from the payload, quiet zone in
  modules, module size in millimetres at a chosen print width, logo/error-correction advice,
  inverted-code warning, one-tap fixes, and a real `BarcodeDetector` decode test.
- **A4 print sheet** export: six copies per page with cut guides and captions.

### Changed
- **Default quiet zone raised** from 16px to 96px at 600px (~5.9 modules) so a fresh code is
  standards-compliant before any tweaking. Existing saved codes keep their own margin.

## [1.1.0] — 2026-11-19

### Changed
- **Export stack is loaded on demand.** `jsPDF`, `JSZip` and `FileSaver` (≈197 kB gzip) are
  fetched on the first export instead of on the first paint; the bulk ZIP stack is imported
  when a batch is generated. First-load JavaScript dropped from ~375 kB to ~173 kB gzip.
- Removed the unused `html2canvas` dependency.

### Removed
- Fake `aggregateRating` (4.9 / 1284) from the structured data.

### Added
- Vitest suite, `npm test` / `npm run typecheck`, the CI workflow, and `LICENSE`,
  `CONTRIBUTING.md`, `SECURITY.md`, this changelog.

## [1.0.0] — 2026-11-19


### Added
- 20 QR types, 10 design presets, 7 export formats, bulk CSV → ZIP, template library,
  history and local analytics.
- Real-render preset swatches; preview and export share one options builder, so a merged
  renderer instance always matches a fresh one.
- Transparent presets are composited onto white for JPEG/PDF/EPS.
- GitHub icon in the top bar pointing at the repository, developer showcase, credits sheet,
  command palette, PWA install and offline shell.
