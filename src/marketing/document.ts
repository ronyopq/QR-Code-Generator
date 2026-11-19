/**
 * Builds a complete, JS-free HTML document for a landing page.
 *
 * Asset URLs are relative one level up (`../assets/…`, `../favicon.svg`) so the
 * exact same file works at https://qrforge-bd.vercel.app/wifi-qr-code/ and at
 * https://ronyopq.github.io/QR-Code-Generator/wifi-qr-code/ — while canonical,
 * OG and schema URLs stay absolute and point at the canonical host.
 */
import { SITE, absolute } from './content'

export interface DocumentParts {
  /** Page <title>, ≤ 60 chars (enforced by the build). */
  title: string
  description: string
  /** Path of this page, e.g. `/wifi-qr-code`. */
  path: string
  /** Rendered body markup. */
  body: string
  /** Serialized JSON-LD (already escaped). */
  jsonld: string
  /** Stylesheet href as emitted by Vite, e.g. `./assets/index-abc.css`. */
  cssHref: string
  ogImage?: string
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** `./assets/x.css` → `../assets/x.css` (pages live one directory deep). */
function upOneLevel(href: string): string {
  return href.replace(/^\.\//, '../').replace(/^\/(?!\/)/, '../')
}

export function renderDocument(parts: DocumentParts): string {
  const canonical = absolute(parts.path)
  const ogImage = parts.ogImage ?? `${absolute(parts.path)}.png`
  const css = upOneLevel(parts.cssHref)

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>${esc(parts.title)}</title>
    <meta name="description" content="${esc(parts.description)}" />
    <meta name="author" content="Rony Siddiqi" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${canonical}" />
    <link rel="alternate" hreflang="en" href="${canonical}" />
    <link rel="alternate" hreflang="x-default" href="${canonical}" />

    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${esc(SITE.name)}" />
    <meta property="og:locale" content="${SITE.locale}" />
    <meta property="og:title" content="${esc(parts.title)}" />
    <meta property="og:description" content="${esc(parts.description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(parts.title)}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="${SITE.twitterHandle}" />
    <meta name="twitter:creator" content="${SITE.twitterHandle}" />
    <meta name="twitter:title" content="${esc(parts.title)}" />
    <meta name="twitter:description" content="${esc(parts.description)}" />
    <meta name="twitter:image" content="${ogImage}" />

    <meta name="theme-color" content="${SITE.themeColor}" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#07080a" media="(prefers-color-scheme: dark)" />
    <meta name="color-scheme" content="light dark" />
    <link rel="icon" type="image/svg+xml" href="../favicon.svg" />
    <link rel="apple-touch-icon" href="../icons/icon-192.png" />
    <link rel="manifest" href="../manifest.webmanifest" />
    <link rel="stylesheet" href="${css}" />

    <script type="application/ld+json">${parts.jsonld}</script>

    <style>
      html { background: #f7f7f4; color-scheme: light dark; }
      html.dark { background: #07080a; }
      body { margin: 0; }
    </style>
  </head>
  <body>
    <script>
      (function () {
        try {
          var saved = localStorage.getItem('qrforge-theme');
          var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.toggle('dark', dark);
          document.documentElement.classList.toggle('light', !dark);
        } catch (e) {
          document.documentElement.classList.add('dark');
        }
      })();
    </script>
    <div id="root">${parts.body}</div>
    <noscript>
      <div style="padding: 1.5rem; font-family: system-ui, sans-serif; line-height: 1.6; border-top: 1px solid #e5e5df">
        <p>This page is fully static. The generator itself needs JavaScript — it runs entirely in your browser.</p>
      </div>
    </noscript>
  </body>
</html>
`
}
