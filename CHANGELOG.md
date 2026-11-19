# Changelog

All notable changes to QRForge are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
