# Security Policy

Ember is a **local-first** application. It has no backend, no accounts, no telemetry, and makes
no network requests at runtime. All data lives in the browser's `localStorage` on the user's own
device. This dramatically reduces the attack surface — there is no server to breach and no data in
transit to intercept.

## Security posture

- **No secrets in the repo.** There are no API keys, tokens, or credentials anywhere in the
  codebase, and none are required to build or run it.
- **No runtime network calls.** The app never contacts a server. The only external resource is a
  Google Fonts stylesheet referenced in `index.html`; remove it to run fully air-gapped.
- **XSS-safe rendering.** All user-entered text (goal titles, notes, category names) is rendered
  through React's escaped text nodes. The codebase contains **no** `dangerouslySetInnerHTML`,
  `eval`, `new Function`, or direct `innerHTML` assignment.
- **No browser storage of sensitive data.** Only the user's own goals/settings are stored, locally.
- **Dependencies pinned & audited.** A committed `package-lock.json` pins the full dependency
  tree. `npm audit` reports **0 vulnerabilities**; a transitive `esbuild` dev-server advisory is
  resolved via an `overrides` entry. CI runs `npm audit` on every push and PR.
- **Automated scanning.** GitHub CodeQL analyses every push/PR, and Dependabot opens PRs for
  vulnerable or outdated dependencies weekly.
- **Least-privilege CI.** Workflows declare `permissions: contents: read` by default and only
  elevate where strictly required (CodeQL result upload).

## Hardening when you deploy

Ember is a static bundle. When hosting it, set these response headers for defense-in-depth (they
are intentionally *not* baked into `index.html` so they don't interfere with the Vite dev server's
HMR):

```
Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

`'unsafe-inline'` for `style-src` is required because the UI uses inline styles for runtime
theming; no inline or third-party scripts are used. Remove the Google Fonts entries to self-host
fonts and tighten the policy further.

## Supported versions

| Version | Supported |
| ------- | --------- |
| 1.x     | ✅        |

## Reporting a vulnerability

Please **do not** open a public issue for security reports. Instead, use GitHub's private
**[Security advisories](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)**
flow on this repository (Security → Report a vulnerability), or contact the maintainer directly.

You can expect an initial acknowledgement within a few days. Thank you for helping keep Ember
safe.
