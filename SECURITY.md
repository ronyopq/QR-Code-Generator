# Security policy

## Reporting

Please report suspected vulnerabilities privately — open a
[security advisory](https://github.com/ronyopq/QR-Code-Generator/security/advisories/new)
or email the maintainer listed on the GitHub profile. Do not file a public issue first.
Expect an acknowledgement within a few days.

## Design notes

- QRForge is **100% client-side**. There is no backend, no account and no analytics
  service; every QR code, logo and history entry stays in the visitor's browser
  (`localStorage`) and in exported files.
- The app makes no network requests at runtime other than loading its own static assets.
- User-supplied logos are read with `FileReader`, rendered into a canvas and never uploaded.
- Bulk CSV is parsed in the browser; nothing is transmitted.
- The service worker caches only same-origin app-shell assets.

Because there is no server, the realistic attack surface is a malicious deploy of the
static bundle, so releases are built by GitHub Actions from `main` and published to
GitHub Pages / Vercel only from that commit.
