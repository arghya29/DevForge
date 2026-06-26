# Contributing to DevForge

Thank you for your interest in contributing! DevForge is a beginner-friendly project and we welcome all kinds of contributions — new lessons, bug fixes, design improvements, and documentation.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Branching Strategy](#branching-strategy)
- [How to Contribute](#how-to-contribute)
- [Project Structure](#project-structure)
- [Adding a Lesson](#adding-a-lesson)
- [Running CI Checks Locally](#running-ci-checks-locally)
- [Reporting Bugs](#reporting-bugs)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Style Guide](#style-guide)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md).
By participating, you agree to uphold it.

---

## Branching Strategy

```
your fork / feature branch
          │
          ▼  Pull Request  ←── always target dev, never main
         dev
          │
          ▼  Maintainer pushes dev → main
         main ──► GitHub Pages auto-deploys
```

- **All PRs must target `dev`** — PRs targeting `main` will be closed
- `main` is the clean, live, deployed branch — only the maintainer pushes to it
- CI checks run on every PR to `dev` and every push to both `dev` and `main`

---

## How to Contribute

### 1. Fork & Clone

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/DevForge.git
cd DevForge
```

### 2. Switch to dev and create your branch

```bash
git checkout dev
git pull origin dev                        # make sure you're up to date
git checkout -b feature/your-feature-name  # create your branch off dev
```

Branch naming examples:

- `feature/add-css-variables-lesson`
- `fix/editor-cursor-alignment`
- `docs/improve-readme`

### 3. Open in Browser

No build step — just open `index.html` in your browser:

```bash
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

Or use the VS Code **Live Server** extension for auto-reload on save.

### 4. Make Your Changes

Edit the relevant file:

- New lesson content → `curriculum.js`
- Visual / layout changes → `styles.css`
- App logic / features → `app.js`
- Page structure → `index.html`

### 5. Run CI Checks Locally

```bash
npm install       # one time only
npm run check     # runs ESLint + HTML Validate + Prettier
```

Fix any errors before pushing. See [Running CI Checks Locally](#running-ci-checks-locally) for details.

### 6. Push and Open a Pull Request

```bash
git add .
git commit -m "feat: add CSS variables lesson"
git push origin feature/your-feature-name
```

Then open a PR on GitHub — **make sure the base branch is `dev`**, not `main`. Fill in the PR template.

---

## Project Structure

```
DevForge/
├── index.html        # Pure HTML structure — zero inline styles or scripts
├── styles.css        # All CSS — variables, layout, components, animations
├── curriculum.js     # All lesson data (CURRICULUM array)
├── app.js            # All application logic
├── package.json      # Dev tools (ESLint, Prettier, html-validate)
├── eslint.config.js  # ESLint rules
├── .prettierrc       # Prettier config
├── .html-validate.json  # HTML validator config
├── README.md
├── LICENSE
├── CONTRIBUTING.md   ← you are here
├── CODE_OF_CONDUCT.md
├── CHANGELOG.md
├── .gitignore
└── .github/
    ├── workflows/
    │   ├── ci.yml          # CI: runs on PRs to dev + pushes to dev & main
    │   └── deploy.yml      # Deploy: runs on push to main only
    ├── PULL_REQUEST_TEMPLATE.md
    └── ISSUE_TEMPLATE/
        ├── bug_report.md
        └── feature_request.md
```

---

## Adding a Lesson

The easiest contribution is a new lesson. All lesson content lives in `curriculum.js`.

### Lesson object structure

```js
{
  id:          "html-06",            // unique, kebab-case, never reuse
  tag:         "HTML",               // "HTML" | "CSS" | "JS"
  title:       "Semantic Elements",  // short, shown in sidebar
  xp:          25,                   // 20–50 depending on difficulty
  paneTitle:   "06 · Semantic Elements",
  instruction: `
    <h2>Your lesson heading</h2>
    <p>Explain the concept. Use <code>inline code</code> for tags/properties.</p>
    <div class="hint-box">💡 A hint to guide the learner.</div>
    <div class="challenge-box">⚔ An optional stretch challenge.</div>
  `,
  html: `<!-- starter HTML -->`,
  css:  `/* starter CSS */`,
  js:   `// starter JS`
}
```

### Rules for lesson content

- **Starter code must work immediately** — clicking Run right away should show something visible, not a blank page or an error
- **One concept per lesson** — don't introduce multiple unrelated things at once
- **Always include a `hint-box`** — tell learners what to try changing
- **`challenge-box` is optional** — add one if there's a natural stretch goal
- **XP guide**: 20 = introductory HTML, 25 = basic CSS/JS, 30 = intermediate, 35–40 = advanced, 50 = capstone
- **Keep instruction prose short** — the pane is small, aim for 2–3 sentences max per paragraph

### Adding to an existing chapter

Find the right chapter in `curriculum.js` and append your lesson to its `lessons` array. The sidebar, progress bar, and nav buttons update automatically — no other file needs to change.

### Adding a new chapter

Add a new object to the top-level `CURRICULUM` array:

```js
{
  chapter: "Advanced JavaScript",
  lessons: [ /* your lessons */ ]
}
```

---

## Running CI Checks Locally

Before pushing, run the same checks that GitHub Actions runs so you're not surprised by failures on your PR.

### Install tools (one time only)

```bash
npm install
```

### Run all checks at once

```bash
npm run check
```

### Run individual checks

```bash
npm run lint:js       # ESLint on app.js and curriculum.js
npm run lint:html     # HTML validate on index.html
npm run format:check  # Prettier format check on all files
```

### Auto-fix formatting

```bash
npm run format:fix    # Prettier rewrites files in place
```

### What each check does

| Check         | Tool          | What it catches                                                        |
| ------------- | ------------- | ---------------------------------------------------------------------- |
| JS Lint       | ESLint        | Undefined variables, `==` instead of `===`, unused vars, syntax errors |
| HTML Validate | html-validate | Broken tags, missing doctype, invalid nesting, missing alt attributes  |
| Format Check  | Prettier      | Inconsistent indentation, quote style, trailing commas                 |

> **Note:** `node_modules/` is in `.gitignore` — never commit it.

---

## Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md).

Include:

- Browser name and version
- Steps to reproduce
- What you expected vs what happened
- A screenshot if relevant

---

## Pull Request Guidelines

- **All PRs must target `dev`** — not `main`
- **One concern per PR** — don't mix a new lesson with a CSS refactor
- **Descriptive title** — `fix: cursor misalignment in Firefox` not `fix bug`
- **Fill in the PR template** and link to the issue it closes
- **No external dependencies** — DevForge deliberately has zero runtime libraries. Keep it that way
- **All 3 CI checks must pass** before a PR can be merged

---

## Style Guide

### JavaScript (`app.js`)

- `"use strict"` at the top
- `const` by default, `let` only when reassignment is needed
- Descriptive variable names — no single-letter names outside loop counters
- Comment every major section with the `/* ══ SECTION ══ */` style already in the file

### CSS (`styles.css`)

- All colors via CSS custom properties from `:root` — no raw hex in rules
- Group related rules under the labelled section comments
- No `!important`

### HTML (`index.html`)

- No inline `style=""` attributes
- Semantic elements where appropriate (`<aside>`, `<header>`, `<button>`)

### Lesson content (`curriculum.js`)

- Indent starter code with 2 spaces
- Keep starter code short — learners need to understand it at a glance
- Escape backticks inside template literal starter code with `\``
