# Security Policy

At DevForge, we take the security of our users and their data seriously. We are committed to ensuring that our educational platform provides a safe environment for learning web development.

## 🛡️ Threat Model & Scope

DevForge is a **fully static, client-side application** with zero backend dependencies. All user data, code, and progress are stored entirely within the user's browser (LocalStorage). 

Because of this architecture, our primary security concerns differ from traditional web applications.

### In Scope
- **Sandbox Escapes:** Any vulnerability allowing user-written code within the live preview (`iframe`) to escape the `sandbox` restrictions and execute arbitrary code in the parent window context.
- **Supply Chain Attacks:** Malicious code injection into the build pipeline, test suite, or GitHub Actions.
- **Cross-Site Scripting (XSS):** Any XSS that allows an attacker to execute code without the user explicitly writing and running that code in the editor (e.g., via malicious URLs or imported payloads).

### Out of Scope
- **Self-XSS:** DevForge is inherently a code editor designed to run user-provided JavaScript. Users writing scripts that execute within the sandboxed preview are behaving entirely as intended.
- **Physical Access:** Vulnerabilities requiring physical access to a user's device or unlocked browser.
- **Local Storage Tampering:** Since progress data is stored locally without backend sync, modifying local `localStorage` keys to alter XP or curriculum progress is considered cheating, not a security vulnerability.
- **Denial of Service (DoS):** Client-side DoS caused by infinite loops or memory leaks written intentionally by the user in the editor.

## 📦 Supported Versions

We currently support the latest major version on the default branch. Security updates are applied directly to the active branch.

| Version | Supported          |
| ------- | ------------------ |
| `main` / `dev` | :white_check_mark: |
| Old Forks | :x:                |

## 🚨 Reporting a Vulnerability

If you believe you have found a security vulnerability in DevForge, **please do not disclose it publicly on the issue tracker**. 

Instead, please report it via one of the following channels:
1. **GitHub Security Advisories:** Use the "Report a vulnerability" feature in the **Security** tab of this repository.
2. **Email:** Send a detailed report to the core maintainers (arghya29@github).

### What to include in your report:
- A description of the vulnerability and its potential impact.
- Detailed steps to reproduce the issue.
- A proof-of-concept (PoC) if available.
- Your assessment of the threat severity.

### Response Timeline
- **Acknowledgment:** Within 48 hours of your report.
- **Assessment & Patching:** Within 1-2 weeks depending on the severity and complexity.
- **Disclosure:** We will coordinate with you to publish a security advisory once the patch is live.

## 🔒 Security Architecture Highlights
- **Sandboxed Iframe:** Live previews are rendered in a restricted iframe with strict `sandbox` attributes to prevent unauthorized DOM access to the parent application.
- **Zero Dependencies:** By design, DevForge avoids third-party runtime dependencies, drastically reducing the surface area for supply chain attacks.
- **No PII Collection:** The application does not collect, transmit, or store personally identifiable information (PII). Everything runs locally on your machine.

*Thank you for helping keep DevForge secure for learners worldwide!*
