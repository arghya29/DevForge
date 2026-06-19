# Contributing to DevForge

Thank you for your interest in contributing! DevForge is a beginner-friendly project and we welcome all kinds of contributions — new lessons, bug fixes, design improvements, documentation, and more.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Project Structure](#project-structure)
- [Adding a Lesson](#adding-a-lesson)
- [Reporting Bugs](#reporting-bugs)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Style Guide](#style-guide)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md).
By participating, you agree to uphold it. Please report unacceptable behaviour to the maintainers via a GitHub issue.

---

## How to Contribute

### 1. Fork & Clone

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/DevForge.git
cd DevForge
```

### 2. Open in Browser

No build step needed — just open `index.html` directly in your browser:

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

Or use the VS Code **Live Server** extension for auto-reload on save.

### 3. Make Your Changes

Edit the relevant file:
- New lesson content → `curriculum.js`
- Visual/layout changes → `styles.css`
- App logic/features → `app.js`
- Page structure → `index.html`

### 4. Test

- Open `index.html` in Chrome, Firefox, and Safari
- Check that the editor cursor stays aligned with text
- Check that the preview renders correctly
- Check that the console panel shows logs
- Check that keyboard shortcuts still work

### 5. Open a Pull Request

Push your branch and open a PR against `main`. Fill in the PR template.

---

## Project Structure

```
DevForge/
├── index.html        # HTML structure only — no inline styles or scripts
├── styles.css        # All CSS — variables, layout, components, animations
├── curriculum.js     # All lesson data (CURRICULUM array)
├── app.js            # All application logic
├── README.md
├── LICENSE
├── CONTRIBUTING.md   ← you are here
├── CODE_OF_CONDUCT.md
├── CHANGELOG.md
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
└── .gitignore
```

---

## Adding a Lesson

The easiest and most valuable contribution is a new lesson. All lesson content lives in `curriculum.js`.

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
    <p>Explain the concept clearly. Use <code>inline code</code> for tags/properties.</p>
    <div class="hint-box">💡 A hint to guide the learner.</div>
    <div class="challenge-box">⚔ An optional stretch challenge.</div>
  `,
  html: `<!-- starter HTML code -->`,
  css:  `/* starter CSS */`,
  js:   `// starter JS`
}
```

### Rules for lesson content

- **Starter code must work on its own** — when Run is clicked immediately, the preview should render something visible, not a blank page or an error.
- **One concept per lesson** — don't introduce three new things at once.
- **Always include a `hint-box`** — tell learners what to try changing.
- **`challenge-box` is optional** — add one if there's a natural stretch goal.
- **XP guide**: 20 = beginner HTML, 25 = basic CSS/JS, 30 = intermediate, 35–40 = advanced, 50 = capstone.
- **Keep instruction HTML under ~300 characters of prose** — the pane is small.

### Adding to an existing chapter

Find the chapter in `curriculum.js` and append your lesson to its `lessons` array. The sidebar, progress bar, and nav buttons update automatically.

### Adding a new chapter

Add a new object to the top-level `CURRICULUM` array:

```js
{
  chapter: "Chapter Name",
  lessons: [ /* your lessons */ ]
}
```

---

## Reporting Bugs

Please use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md).

Include:
- Browser name and version
- Steps to reproduce
- What you expected vs what happened
- A screenshot if relevant (especially for editor cursor issues)

---

## Pull Request Guidelines

- **One concern per PR** — don't mix a new lesson with a CSS refactor.
- **Descriptive title** — `fix: cursor misalignment in editor on Firefox` not `fix bug`.
- **Fill in the PR template** — link to the issue it closes.
- **No external dependencies** — DevForge deliberately has zero npm packages or CDN scripts beyond Google Fonts. Keep it that way.
- **Test in at least 2 browsers** before submitting.

---

## Style Guide

### JavaScript (`app.js`)
- `"use strict"` at the top
- `const` by default, `let` only when reassignment is needed
- Function declarations for top-level named functions
- Descriptive variable names — no single-letter names outside of loop counters
- Comment every major section with the `/* ══ SECTION ══ */` style already used

### CSS (`styles.css`)
- All colors via CSS custom properties from `:root` — no raw hex in rules
- Group related rules under the labelled section comments already in the file
- Mobile-first if adding responsive rules
- No `!important`

### HTML (`index.html`)
- No inline `style=""` attributes
- No inline `onclick=""` — use `addEventListener` in `app.js` where possible
  (existing `onclick` attributes are acceptable to keep for now)
- Semantic elements where appropriate (`<aside>`, `<header>`, `<button>`)

### Lesson content (`curriculum.js`)
- Indent starter code with 2 spaces
- Keep starter code short — learners need to understand it at a glance
- Escape backticks inside template literal starter code with `\``