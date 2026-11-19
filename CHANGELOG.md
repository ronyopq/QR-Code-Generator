# Changelog

All notable changes to QRForge are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] — 2026-11-19

### Added
- **Bengali interface.** A zero-dependency i18n layer (`src/lib/i18n.tsx`) with a flat
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
