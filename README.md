# ⚡ DevForge — Learn by Building

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=for-the-badge)](./LICENSE)&nbsp;&nbsp;
[![GitHub Pages](https://img.shields.io/badge/Deployed-GitHub%20Pages-brightgreen?style=for-the-badge)](https://arghya29.github.io/DevForge/)&nbsp;&nbsp;
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](./CONTRIBUTING.md)

![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red.svg?style=for-the-badge)

A fully client-side, **zero-dependency** interactive coding environment for learning HTML, CSS, and JavaScript. No servers. No npm. No build tools. Open `index.html` and start coding.

🌐 **Live Demo:** [arghya29.github.io/DevForge](https://arghya29.github.io/DevForge/)

---

## 📸 What It Looks Like

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚡ DevForge     [HTML] [CSS] [JS]      Auto  0/16 ░░░░  Aa  ⌨  ▶ Run │
├────────────┬──────────────────────────┬───┬────────────────────────┤
│            │  1  <!DOCTYPE html>       │   │  🟢 LIVE PREVIEW       │
│ Curriculum │  2  <html lang="en">      │   │                        │
│ ─────────  │  3  <head>                │   │   Hello, World!        │
│ ● Lesson 1 │  4    <title>…</title>   │ ↔ │                        │
│ ○ Lesson 2 │  5  </head>              │   ├────────────────────────┤
│            │  6  <body>               │   │ CONSOLE                │
│            │  7    <h1>Hello!</h1>    │   │ › Page loaded!         │
│ XP: 20     ├──────────────────────────┤   │                        │
│ 🔥 1 streak│  📖 What is an element?  │   │                        │
└────────────┴──────────────────────────┴───┴────────────────────────┘
```

---

## 🚀 Quick Start

### Option 1 — GitHub Pages (already live)

Visit **[arghya29.github.io/DevForge](https://arghya29.github.io/DevForge/)** — nothing to install.

### Option 2 — Run locally

```bash
git clone https://github.com/arghya29/DevForge.git
cd DevForge
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

No `npm install`. No build step. It just works.

---

## 📁 Project Structure

```
DevForge/
├── index.html              # Pure HTML structure — zero inline styles or scripts
├── styles.css              # All CSS — variables, layout, components, animations
├── curriculum.js           # All 16 lesson objects with starter code + instructions
├── app.js                  # All application logic — editor, preview, XP, shortcuts
│
├── README.md
├── LICENSE                 # Apache 2.0
├── CONTRIBUTING.md         # How to add lessons and contribute
├── CODE_OF_CONDUCT.md      # Contributor Covenant v2.1
├── CHANGELOG.md            # Version history
├── package.json            # Dev tools (ESLint, Prettier, html-validate)
├── eslint.config.js        # ESLint rules
├── .prettierrc             # Prettier formatting config
├── .prettierignore         # Files Prettier should skip
├── .html-validate.json     # HTML validator config
├── .gitignore
│
└── .github/
    ├── workflows/
    │   ├── ci.yml                  # CI checks on PRs to dev + pushes to dev & main
    │   └── deploy.yml              # Auto-deploys to GitHub Pages on push to main
    ├── PULL_REQUEST_TEMPLATE.md
    └── ISSUE_TEMPLATE/
        ├── bug_report.md
        └── feature_request.md
```

### File responsibilities

| File            | Role                                                                   |
| --------------- | ---------------------------------------------------------------------- |
| `index.html`    | Skeleton only — every panel, button, modal defined here                |
| `styles.css`    | Every CSS rule — variables, layout grid, components, animations        |
| `curriculum.js` | Single `CURRICULUM` array — add new lessons here, nothing else changes |
| `app.js`        | Brain — sidebar, editor, run/preview, console, XP, keyboard shortcuts  |

---

## 📚 Curriculum (16 lessons · 455 XP total)

### HTML Foundations

| #   | Lesson                | XP  |
| --- | --------------------- | --- |
| 01  | Your First Element    | 20  |
| 02  | Headings & Paragraphs | 20  |
| 03  | Lists & Links         | 20  |
| 04  | Images & Attributes   | 20  |
| 05  | Forms & Inputs        | 30  |

### CSS Styling

| #   | Lesson                   | XP  |
| --- | ------------------------ | --- |
| 01  | Selectors & Specificity  | 25  |
| 02  | The Box Model            | 25  |
| 03  | Flexbox Layout           | 30  |
| 04  | CSS Grid                 | 30  |
| 05  | Transitions & Animations | 35  |

### JavaScript

| #   | Lesson                      | XP  |
| --- | --------------------------- | --- |
| 01  | Variables & Types           | 25  |
| 02  | Functions                   | 25  |
| 03  | Arrays & Loops              | 30  |
| 04  | DOM Manipulation            | 30  |
| 05  | Fetch & Async/Await         | 40  |
| 06  | Build a Todo App (capstone) | 50  |

---

## ✨ Features

| Feature                 | Detail                                                            |
| ----------------------- | ----------------------------------------------------------------- |
| **Live Preview**        | Runs inside a sandboxed `<iframe>` — no server needed             |
| **Console Panel**       | Intercepts `console.log/warn/error` via `postMessage` from iframe |
| **Code Buffers**        | Each lesson remembers your edits independently in memory          |
| **XP & Streak**         | Points awarded on first run of each lesson                        |
| **Auto-run**            | Preview updates 0.9s after you stop typing                        |
| **Preview Sizes**       | Desktop / Tablet (768px) / Mobile (390px)                         |
| **Drag Resizer**        | Resize editor vs preview split                                    |
| **Lesson Search**       | Filter sidebar lessons in real time                               |
| **Font Size**           | Slider from 11px to 20px                                          |
| **Auto-indent**         | Enter key matches current line indentation                        |
| **Auto-close**          | Brackets and quotes auto-close as you type                        |
| **Keyboard Shortcuts**  | Full set — see table below                                        |
| **Completion Confetti** | Celebration when all 16 lessons are done                          |

### ⌨ Keyboard Shortcuts

| Shortcut           | Action                |
| ------------------ | --------------------- |
| `Ctrl + Enter`     | Run code              |
| `Ctrl + ]`         | Next lesson           |
| `Ctrl + [`         | Previous lesson       |
| `Ctrl + 1`         | Switch to HTML tab    |
| `Ctrl + 2`         | Switch to CSS tab     |
| `Ctrl + 3`         | Switch to JS tab      |
| `Ctrl + Shift + R` | Reset code to starter |
| `Ctrl + Shift + C` | Copy all code         |
| `Escape`           | Close any open panel  |

---

## 🔁 Branching Strategy

```
contributor fork
      │
      ▼
  feature branch
      │
      ▼  Pull Request (CI checks run here)
     dev  ◄─────── all PRs target dev
      │
      ▼  Push to main (CI checks run again)
     main ──► GitHub Pages auto-deploys
```

- **All pull requests must target `dev`** — never `main` directly
- CI checks run on every PR to `dev` and every push to `dev` and `main`
- `main` is always the clean, deployed version

---

## 🌐 GitHub Pages Deployment

Deploying on GitHub Pages is the right choice for DevForge — it's 100% static, needs no server, and the included `deploy.yml` workflow auto-deploys every push to `main`.

### One-time setup

1. Go to your repo → **Settings → Pages**
2. Under **Source** → select **GitHub Actions**
3. Push any commit to `main` — the workflow triggers automatically
4. Live at `https://arghya29.github.io/DevForge/`

---

## 🤝 Contributing

Contributions are welcome! All PRs must target the **`dev`** branch.

Read [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide. Quick version:

```bash
git clone https://github.com/arghya29/DevForge.git
cd DevForge
git checkout dev
# make your changes
git checkout -b feature/your-feature-name
# open a PR targeting dev
```

**To add a lesson**, open `curriculum.js` and add an object to any chapter's `lessons` array:

```js
{
  id:          "html-06",
  tag:         "HTML",
  title:       "Semantic Elements",
  xp:          25,
  paneTitle:   "06 · Semantic Elements",
  instruction: `<h2>Writing meaningful HTML</h2>
    <p>Use <code>&lt;header&gt;</code> and <code>&lt;main&gt;</code>
    instead of generic divs.</p>
    <div class="hint-box">💡 Try adding a &lt;nav&gt; element!</div>`,
  html: `<!DOCTYPE html>\n<html>\n<body>\n  <header>My Site</header>\n</body>\n</html>`,
  css:  `body { font-family: sans-serif; padding: 20px; }`,
  js:   ``
}
```

The sidebar, progress bar, and nav buttons update automatically.

---

## 🏆 Open Source Programs

This project welcomes contributions via:

- **[GSSoC](https://gssoc.girlscript.tech/)** (GirlScript Summer of Code)
- **[Hacktoberfest](https://hacktoberfest.com/)** — PRs in October count
- **[KWOC](https://kwoc.kossiitkgp.org/)** (Kharagpur Winter of Code)
- **[Script Winter of Code](https://swoc.scriptindia.org/)**

### Good first issues for newcomers

- Add a new HTML lesson (semantic elements, tables, multimedia)
- Add a new CSS lesson (custom properties, media queries)
- Add a new JS lesson (objects, classes, localStorage)
- Fix a typo in any lesson instruction
- Improve mobile layout of the sidebar

---

## 🏗️ Architecture Notes

**Why no frameworks?**
DevForge is a tool for people learning their first lines of code. A `node_modules` folder or webpack config would be intimidating and irrelevant. Pure HTML/CSS/JS keeps the project inspectable and educational.

**How does the console panel work?**
The preview runs in a `sandbox="allow-scripts"` iframe. Sandboxed iframes can't access the parent window directly, so the app overwrites `console.log/warn/error` inside the iframe to fire `postMessage` to the parent, which renders each call in the console panel.

**Why is `curriculum.js` separate from `app.js`?**
A teacher or contributor can add lessons by touching only `curriculum.js` — with zero risk of breaking app logic.

---

## 📄 License

Licensed under the **[Apache License 2.0](./LICENSE)**.

Free to use, modify, and distribute — including commercially — as long as you include the original license notice and state any changes made to the source files.

---

<p align="center">Built with ⚡ by <a href="https://github.com/arghya29">arghya29</a> and contributors</p>
