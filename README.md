# ⚡ DevForge — Learn by Building

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=for-the-badge)](./LICENSE)&nbsp;&nbsp;
[![GitHub Pages](https://img.shields.io/badge/Deployed-GitHub%20Pages-brightgreen?style=for-the-badge)](https://arghya29.github.io/DevForge/)&nbsp;&nbsp;
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](./CONTRIBUTING.md)

[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-orange.svg?style=for-the-badge)](./CONTRIBUTING.md)&nbsp;&nbsp;
![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg?style=for-the-badge)&nbsp;&nbsp;
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
# Then just open index.html in your browser:
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
├── .gitignore
│
└── .github/
    ├── workflows/
    │   └── deploy.yml              # Auto-deploys to GitHub Pages on push to main
    ├── PULL_REQUEST_TEMPLATE.md
    └── ISSUE_TEMPLATE/
        ├── bug_report.md
        └── feature_request.md
```

### File responsibilities

| File            | Role                                                                              |
| --------------- | --------------------------------------------------------------------------------- |
| `index.html`    | Skeleton only — every panel, button, modal defined here with IDs and classes      |
| `styles.css`    | Every CSS rule — CSS variables, layout grid, components, token colors, animations |
| `curriculum.js` | Single `CURRICULUM` array — add new lessons here with zero changes elsewhere      |
| `app.js`        | Brain — sidebar, editor, syntax highlighting, run/preview, console, XP, shortcuts |

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
| **Syntax Highlighting** | Custom regex highlighter for HTML, CSS, JS — zero libraries       |
| **Console Panel**       | Intercepts `console.log/warn/error` via `postMessage` from iframe |
| **Code Buffers**        | Each lesson remembers your edits independently in memory          |
| **XP & Streak**         | Points awarded on first run of each lesson                        |
| **Auto-run**            | Preview updates 0.9s after you stop typing                        |
| **Preview Sizes**       | Desktop / Tablet (768px) / Mobile (390px)                         |
| **Drag Resizer**        | Resize editor vs preview split                                    |
| **Lesson Search**       | Filter sidebar lessons in real time                               |
| **Font Size**           | Slider from 11px to 20px                                          |
| **Keyboard Shortcuts**  | Full set — see table below                                        |
| **Completion Confetti** | Celebration banner when all 16 lessons are done                   |

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

## 🌐 GitHub Pages Deployment

**Yes — deploying on GitHub Pages is the right call.** It's the perfect host for this project:

- No server required (DevForge is 100% static)
- Free, fast, and reliable
- Shareable URL for open source submissions
- Auto-deploys via the included GitHub Actions workflow

### How the auto-deploy works

The file `.github/workflows/deploy.yml` is included in this repo. Every time you push to `main`, GitHub Actions automatically deploys the latest version to GitHub Pages. You don't need to do anything manually.

### Setup (one-time)

1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Push any commit to `main` — the workflow triggers automatically
4. Your site is live at `https://YOUR_USERNAME.github.io/DevForge/`

---

## 🤝 Contributing

Contributions are very welcome! The most impactful thing you can do is **add a new lesson**.

Read [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide. Quick version:

```bash
git clone https://github.com/arghya29/DevForge.git
cd DevForge
# Make changes — no install needed
# Open a PR against main
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

The sidebar, progress bar, and nav buttons update automatically — no other files to touch.

---

## 🏗️ Architecture Notes

**Why no frameworks?**
DevForge is a tool for people learning their first lines of code. A `node_modules` folder or webpack config would be intimidating and irrelevant. Pure HTML/CSS/JS keeps the project itself inspectable and educational.

**How does syntax highlighting work?**
A transparent `<textarea>` sits on top of a styled `<div>`. You type into the textarea (which handles native editing — cursor, selection, undo/redo). A regex highlighter runs on every keystroke and updates the `<div>` behind it. The textarea uses `color: transparent` and `-webkit-text-fill-color: transparent` so only the highlight layer is visible, while `caret-color: var(--cyan)` keeps the cursor visible.

**How does the console panel work?**
The preview runs in a `sandbox="allow-scripts"` iframe. Sandboxed iframes can't access the parent window directly, so the app secretly overwrites `console.log/warn/error` inside the iframe to fire `postMessage` to the parent, which renders each call in the console panel with a timestamp.

**Why is `curriculum.js` separate from `app.js`?**
Content and logic should never be in the same file. A teacher or contributor can add lessons, fix typos, or rewrite instructions by touching only `curriculum.js` — with zero risk of breaking app logic.

---

## 🏆 Open Source Programs

This project is eligible for and welcomes contributions via:

- **[GSSoC](https://gssoc.girlscript.tech/)** (GirlScript Summer of Code)
- **[Hacktoberfest](https://hacktoberfest.com/)** — PRs opened in October count
- **[KWOC](https://kwoc.kossiitkgp.org/)** (Kharagpur Winter of Code)
- **[Script Winter of Code](https://swoc.scriptindia.org/)**

If you are a maintainer adding this project to one of the above programs, label issues with `hacktoberfest`, `gssoc`, or `good first issue` as appropriate.

### Good first issues for newcomers

- Add a new HTML lesson (semantic elements, tables, multimedia)
- Add a new CSS lesson (custom properties, media queries, clip-path)
- Add a new JS lesson (objects, classes, localStorage)
- Fix a typo in any lesson instruction
- Improve mobile layout of the sidebar
- Add a dark/light theme toggle

---

## 📄 License

Licensed under the **[Apache License 2.0](./LICENSE)**.

Free to use, modify, and distribute — including commercially — as long as you include the original license notice and clearly state any changes you made to the source files.

---

<p align="center">Built with ⚡ by <a href="https://github.com/arghya29">arghya29</a> and contributors</p>
