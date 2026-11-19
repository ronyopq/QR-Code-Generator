# Changelog

All notable changes to QRForge are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Export stack is loaded on demand.** `jsPDF`, `JSZip` and `FileSaver` (≈197 kB gzip)
  are fetched on the first export instead of on the first paint, and the bulk ZIP stack
  is imported when a batch is generated. First-load JavaScript drops from ~375 kB to
  ~177 kB gzip, and the `modulepreload` hints for the export chunk are gone.
- Removed the unused `html2canvas` dependency.

### Removed
- Fake `aggregateRating` (4.9 / 1284) from the structured data — no review system exists,
  and inventing ratings breaks Google's structured-data policy.

### Added
- Vitest test suite (37 tests): payload builders for every QR type, `toStylingOptions`
  mapping, preset matching matrix, CSV parser, a preview/export purity check across all
  100 ordered preset switches, and a JSDOM render of the real app.
- `npm test`, `npm run test:watch`, `npm run typecheck` scripts.
- `LICENSE` (MIT), `CONTRIBUTING.md`, `SECURITY.md`, this changelog.

## [1.0.0] — 2026-11-19

### Added
- 20 QR types, 10 design presets, 7 export formats, bulk CSV → ZIP, template library,
  history and local analytics.
- Real-render preset swatches; preview and export share one options builder, so a merged
  renderer instance always matches a fresh one.
- Transparent presets are composited onto white for JPEG/PDF/EPS.
- GitHub icon in the top bar pointing at the repository, developer showcase, credits sheet,
  command palette, PWA install and offline shell.
