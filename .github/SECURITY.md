# Security Policy for DevForge

## Supported Versions

DevForge is a static client-side application with zero server-side components.
The following versions receive security updates:

| Version | Supported |
| ------- | --------- |
| 1.x     | ✅ Active |

## Reporting a Vulnerability

DevForge takes security seriously. If you discover a security vulnerability,
please **do NOT** open a public GitHub issue. Instead, disclose it
responsibly by following the steps below.

### How to Report

1. **Email the maintainer** at the address listed in the GitHub profile of
   [@arghya29](https://github.com/arghya29) — or open a
   [security advisory](https://github.com/Babin123456/DevForge/security/advisories/new)
   on GitHub.

2. Include as much detail as possible:
   - Type of vulnerability (XSS, CSRF, etc.)
   - Steps to reproduce
   - Affected browsers / versions
   - Any proof-of-concept code

3. Allow up to **72 hours** for an initial response. We will acknowledge
   receipt and provide an estimated timeline for a fix.

### What to Expect

- Confirmation of receipt within 3 business days
- A severity assessment and fix timeline
- Credit in the release notes (unless you prefer to remain anonymous)

## Security Posture

Since DevForge runs entirely in the browser with no server component,
the main attack surface is:

| Area                      | Risk | Mitigation                                          |
| ------------------------- | ---- | --------------------------------------------------- |
| **User code in iframe**   | Low  | Sandboxed `<iframe sandbox="allow-scripts">`        |
| **Console `postMessage`** | Low  | Type-checked messages, no unsolicited command relay |
| **Lesson `innerHTML`**    | Low  | Lesson content is static JSON, not user-provided    |
| **No dependencies**       | None | Zero runtime libraries = zero supply-chain risk     |

### CSP Note

A Content-Security-Policy meta tag is set in `index.html` to restrict
script sources and mitigate XSS in the parent page. The preview iframe
is intentionally not covered by the parent CSP because it needs to run
arbitrary user code (that is the product).

## Preferred Encryption

If you need to encrypt sensitive information, please use the PGP key
associated with the maintainer's GitHub account or request one via email.

---

Thank you for helping keep DevForge safe for everyone.
