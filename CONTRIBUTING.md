# Contributing

Thanks for helping QRForge. It is a small, dependency-light React app — keep it that way.

## Setup

```bash
npm ci          # install (node 20+)
npm run dev     # http://localhost:5173
```

## Scripts

| script | what it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | typecheck (`tsc -b`) + production build to `dist/` |
| `npm run typecheck` | types only |
| `npm test` | Vitest suite (jsdom) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run preview` | serve the production build |

## Rules of the build

- **Icons are Lucide** (`lucide-react`). No emoji as iconography.
- **Semantic colour tokens** (`text-fg`, `bg-surface`, `border-line` …) — no raw hex in
  components. Hex belongs in `src/data/*` (presets, developer profile) only.
- **No new runtime dependency** unless the same job cannot be done in <100 lines; anything
  added must be listed in the credits sheet with its licence.
- **Preview must equal the download.** Every option key that can be conditional is written
  on every call — see the comment block in `src/lib/qr.ts`. The purity test enforces it.
- **Accessibility first**: 4.5:1 contrast, 44×44 touch targets, visible focus,
  `prefers-reduced-motion` respected, labelled controls.
- Keep the client-only promise: no backend calls, no tracking, no CDN fonts.

## Tests

`npm test` must pass before a PR. Add a test for behaviour you change — payload builders,
preset matching and the preview/export purity check are the highest-value places.

## Commits & PRs

- Conventional-ish prefixes: `feat:`, `fix:`, `docs:`, `perf:`, `test:`, `chore:`.
- One topic per PR. Explain the **cause**, not just the change.
- The PR template checklist: typecheck ✔, tests ✔, build ✔, a11y glance ✔, no raw hex ✔.
