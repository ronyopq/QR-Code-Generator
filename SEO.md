# SEO & AI visibility playbook

Everything here is **automated or documented** — nothing depends on someone remembering a step.
This file is the map: what ships in the build, what only the site owner can do, and what the next
real lever is.

Canonical host: **https://qrforge-bd.vercel.app**

> Why this host: `qrforge.vercel.app` and `qrforge-app.vercel.app` are both assigned to other
> Vercel projects (the API answers `409 Conflict`), and a `.vercel.app` name is globally unique —
> only its current owner can release it. The GitHub Pages copy stays online, but it defers to the
> canonical host through `rel="canonical"`, and GitHub Pages can never own a domain-root
> `robots.txt`, which is why it is not the primary site.

---

## 1. What the build does for you (`npm run build`)

| Output | What it does | Where |
|---|---|---|
| **Prerendered shell** | The headline, all 20 types, 6 features, the 4-step how-to and the 8-question FAQ are rendered to HTML and injected into `#root`. Crawlers that never run JavaScript — Bing's lighter fetcher, GPTBot, ClaudeBot, PerplexityBot, every social scraper — read real content instead of an empty `<div>`. React clears the shell and paints the studio on boot. | `src/marketing/StaticShell.tsx` → `scripts/prerender.mjs` |
| **JSON-LD `@graph`** | WebSite · Organization · Person (Rony Siddiqi + every real profile) · SoftwareApplication (free, MIT, versioned, feature list, repo) · FAQPage · HowTo. Absolute URLs only. No invented ratings. | `src/marketing/structuredData.ts` |
| **`robots.txt`** | Absolute sitemap URL + explicit `Allow` for GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, PerplexityBot, Google-Extended, Applebot-Extended, CCBot, Bingbot. | generated into `dist/` |
| **`sitemap.xml`** | Absolute `<loc>` values and a real `lastmod` (today's date at build time). | generated into `dist/` |
| **`llms.txt`** | One plain-text source of truth for assistants: summary, types, features, formats, FAQ. | generated into `dist/` |
| **Social card** | 1200×630 `og.png` containing a *real, scannable* QR of the canonical URL. | `scripts/og-image.mjs` → `public/og.png` |
| **IndexNow ping** | On every push to `main`, Bing/Yandex/Seznam/Naver are told the canonical URL changed. Key file: `public/<key>.txt`. | `.github/workflows/deploy.yml` |
| **Guard rails** | The build fails if `<title>` exceeds 60 characters, if the shell loses its `<h1>`/FAQ, if JSON-LD stops parsing, or if the short social-card text overflows. SEO regressions break CI, not rankings. | `scripts/prerender.mjs`, `src/marketing/seo.test.tsx` |
| **Headers** | Immutable caching for `/assets/*`, `must-revalidate` for `index.html` and `sw.js`, HSTS, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, and a permanent redirect from the old alias. | `vercel.json` |

Regenerate the social card after any URL or wording change:

```bash
node scripts/og-image.mjs     # needs ImageMagick + DejaVu fonts
npm run seo                   # rerun the prerender step against an existing dist/
```

---

## 2. Three things only the site owner can do (10 minutes, once)

1. **Google Search Console** — <https://search.google.com/search-console>
   - Add a **Domain** or **URL-prefix** property for `https://qrforge-bd.vercel.app`.
   - Choose the **HTML tag** verification method, copy the `content="…"` value and paste it into
     `index.html` as `<meta name="google-site-verification" content="…" />` (right after the
     `<meta name="author">` line). Commit, merge, then click *Verify*.
   - **Sitemaps → Add new sitemap →** `sitemap.xml` → Submit.
   - Then *URL inspection* → paste the URL → **Request indexing** (once; don't spam it).
2. **Bing Webmaster Tools** — <https://www.bing.com/webmasters>
   - Easiest path: *Import from Google Search Console* (one click) — no second meta tag needed.
   - Check **IndexNow** shows the key `8663236961611d6f1aa351a2dc7d9031` as verified and
     *URL submission* is healthy.
3. **Social previews** (refreshes the cache of the old, broken card):
   - X: <https://cards-dev.twitter.com/validator>
   - LinkedIn: <https://www.linkedin.com/post-inspector/>
   - Facebook: <https://developers.facebook.com/tools/debug/> → *Scrape Again*

Optional but effective: submit the site to Product Hunt, AlternativeTo and Awesome-lists, and
link it from the author's own blog (`ronysiddiqi.blogspot.com`, `ronysiddiqi.wordpress.com`).

---

## 3. What to expect, honestly

- **Indexing**: days. A single brand-new host with one page usually gets indexed within 2–7 days
  after the sitemap is submitted.
- **Head terms** ("qr code generator"): competitive, dominated by sites with tens of thousands of
  pages and years of links. A single page will not rank there — that is not a defect, it is scope.
- **Long-tail** ("wifi qr code generator with logo", "vcard qr code free"):
  reachable, and that is where the traffic actually is.

### The next lever (phase 2, the real growth work)

Landing pages — one real URL and one unique page per intent — are worth more than any meta tag:

| Route | Target query |
|---|---|
| `/wifi-qr-code` | wifi qr code generator |
| `/vcard-qr-code` | vcard qr code / digital business card qr |
| `/menu-qr-code` | restaurant menu qr code |
| `/whatsapp-qr-code` | whatsapp qr code generator |
| `/url-qr-code` | url qr code generator free |
| `/how-to/size-a-qr-code` | how big should a qr code be |
| `/how-to/qr-code-with-logo` | qr code with logo still scan |
| `/how-to/qr-not-scanning` | qr code not scanning fix |

Each page needs: a unique `<h1>`, 400–700 words of real answer-first copy, the JSON-LD for that
intent (`HowTo` / `FAQPage`), its own `og:image`, an internal link back to the studio, and an entry
in `ROUTES` (`src/marketing/prerenderEntry.tsx`) so the sitemap stays truthful. Add them as real
routes with prerendering — not as `#hash` views, which search engines ignore.

---

## 4. Measurement

- **Search Console** → Performance → Queries: watch impressions appear first, clicks later.
- **Bing Webmaster** → Search performance; IndexNow gives near-instant re-crawl.
- **Core Web Vitals (CrUX)** becomes available after ~28 days of real traffic; meanwhile run
  Lighthouse with the mobile profile and keep LCP < 2.5 s, CLS < 0.1, INP < 200 ms.
- **AI visibility**: ask ChatGPT / Claude / Perplexity "what is QRForge?" and "free QR code
  generator that works offline" after a couple of weeks. `llms.txt` + the FAQ are what they quote.

---

## 5. Rules this project keeps

- No fake ratings, no invented reviews, no author bylines that do not exist. Structured data must
  describe the page truthfully — that is both a Google policy requirement and the only way answer
  engines keep trusting the source.
- No `#hash` URLs in the sitemap. If it is not a real URL, it is not a page.
- Absolute URLs everywhere a crawler reads one (`canonical`, `og:*`, `sitemap`, JSON-LD).
- One canonical host. Everything else redirects or declares `rel="canonical"`.
