/** The project's public source of truth. One place to edit. */
export const REPO = {
  url: 'https://github.com/ronyopq/QR-Code-Generator',
  label: 'ronyopq/QR-Code-Generator',
  issues: 'https://github.com/ronyopq/QR-Code-Generator/issues',
} as const

/** Open the repository in a new tab (works in jsdom and in every browser). */
export function openRepo() {
  const a = document.createElement('a')
  a.href = REPO.url
  a.target = '_blank'
  a.rel = 'noreferrer'
  a.click()
}
