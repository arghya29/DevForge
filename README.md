# ⚡ DevForge — Learn by Building

A fully client-side, zero-dependency interactive coding environment for learning HTML, CSS, and JavaScript. No servers, no npm, no build tools — just open `index.html` in a browser and start coding.

---

## 📸 What It Looks Like

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚡ DevForge     [HTML] [CSS] [JS]      Auto  0/16 ░░░░  Aa  ⌨  ▶ Run │
├────────────┬──────────────────────────┬───┬────────────────────────┤
│            │ 1  <!DOCTYPE html>        │   │  🟢 LIVE PREVIEW       │
│ Curriculum │ 2  <html lang="en">       │   │                        │
│ ─────────  │ 3  <head>                 │   │  (your code renders    │
│ HTML       │ 4    <title>Hello</title> │   │   here in real time)   │
│  ● Lesson1 │ 5  </head>               │ ↔ │                        │
│  ● Lesson2 │ 6  <body>                │   ├────────────────────────┤
│  ○ Lesson3 │ 7    <h1>Hello!</h1>     │   │ CONSOLE                │
│ ─────────  │ 8  </body>               │   │ › Page loaded!         │
│ CSS        │ 9  </html>               │   │                        │
│  ○ Lesson1 ├──────────────────────────┤   │                        │
│            │ 📖 LESSON                 │   │                        │
│            │  What is an element?...  │   │                        │
│            ├──────────────────────────┤   │                        │
│ XP: 0      │  ← Prev    1/16   Next → │   │                        │
└────────────┴──────────────────────────┴───┴────────────────────────┘
```

---

## 🚀 Quick Start

1. Download all 4 files into the **same folder**
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari)
3. That's it — no internet connection required after the Google Fonts load

```
devforge/
├── index.html       ← Open this in your browser
├── styles.css
├── curriculum.js
└── app.js
```

---

## 📁 Project Structure

### `index.html` — Structure only
The HTML file contains **zero inline styles and zero inline scripts**. It is purely the skeleton of the application — every element, panel, button, and modal is defined here with semantic IDs and class names. It links `styles.css` in the `<head>` and loads `curriculum.js` then `app.js` at the bottom of `<body>`.

### `styles.css` — All visual design
Every single CSS rule lives here. The file is organized into clearly labelled sections:

| Section | What it covers |
|---|---|
| Reset & Root | CSS custom properties (variables), box-sizing reset |
| Scrollbars | Custom thin scrollbar styling |
| Header | Logo, tab buttons, progress bar, run button |
| Workspace | 4-column CSS Grid layout |
| Sidebar | Lesson list, chapter labels, search input, XP footer |
| Editor Panel | File tabs, line numbers, highlight layer, textarea |
| Syntax Tokens | `.tok-kw`, `.tok-str`, `.tok-fn` etc. — highlight colors |
| Lesson Pane | Collapsible instruction area, hint/challenge boxes |
| Lesson Nav | Prev/Next buttons |
| Resizer | Drag handle between editor and preview |
| Preview Panel | iframe wrapper, size buttons, overlay |
| Console | Log output, error badge, timestamps |
| Floating Panels | Shortcuts panel, font size panel |
| Toast | Notification pop-up |
| Modal | Reset confirmation dialog |
| Completion Banner | End-of-curriculum celebration card |
| Confetti | Falling particle animation |
| Glitch | Tab-switch glitch animation |

### `curriculum.js` — All lesson content
Exports a single global array `CURRICULUM`. Each entry is a **chapter** containing an array of **lessons**. Every lesson has:

```js
{
  id:          "html-01",          // unique ID used throughout the app
  tag:         "HTML",             // displayed as a colored badge
  title:       "Your First Element",
  xp:          20,                 // points awarded on first run
  paneTitle:   "01 · Your First Element",
  instruction: `<h2>...</h2>...`,  // HTML string shown in the lesson pane
  html:        `<!DOCTYPE html>...`, // starter code for the HTML tab
  css:         `body { ... }`,       // starter code for the CSS tab
  js:          `console.log(...)`,   // starter code for the JS tab
}
```

To add a new lesson, just add a new object to the right chapter array. No changes to `app.js` or `index.html` are needed.

### `app.js` — All application logic
The brain of DevForge. Organized into clearly commented sections:

| Section | Responsibility |
|---|---|
| State | All mutable variables (`currentLessonId`, `xp`, `buffers`, etc.) |
| Helpers | `getLesson()`, `getAllLessons()`, `getLessonIndex()` |
| Bootstrap | `init()` — wires everything up on page load |
| Sidebar | `buildSidebar()`, `filterLessons()`, search/clear |
| Lesson Loading | `loadLesson()`, `saveCurrentBuffer()` |
| File Tabs | `buildFileTabs()`, `switchTab()`, `loadTab()` |
| Editor Events | `onEditorInput()`, `handleEditorKey()`, `syncScroll()` |
| Syntax Highlighting | `highlight()`, `highlightHTML/CSS/JS()` — regex-based, no libraries |
| Run Code | `runCode()`, `buildPreviewDoc()`, `extractBody()` |
| Lesson Nav | `navLesson()`, `updateNav()` |
| Console | `addConsoleLog()`, `clearConsoleUI()`, postMessage listener |
| Progress | `updateProgress()` |
| Auto-run | `toggleAutorun()` |
| Preview Size | `setPreviewSize()` — desktop / tablet / mobile |
| Reset Modal | `showResetModal()`, `confirmReset()` |
| Copy | `copyAllCode()` |
| Font Size | `changeFontSize()`, `toggleFsPanel()` |
| Shortcuts Panel | `toggleShortcuts()` |
| Completion | `showCompletion()`, `spawnConfetti()`, `restartAll()` |
| Toast | `showToast(msg, type, icon)` |
| Resizer | `initResizer()` — drag-to-resize editor/preview split |
| Keyboard | Global `keydown` listener for all shortcuts |

---

## 📚 Curriculum

16 lessons across 3 chapters:

### Chapter 1 — HTML Foundations (5 lessons)
| # | Title | XP |
|---|---|---|
| 01 | Your First Element | 20 |
| 02 | Headings & Paragraphs | 20 |
| 03 | Lists & Links | 20 |
| 04 | Images & Attributes | 20 |
| 05 | Forms & Inputs | 30 |

### Chapter 2 — CSS Styling (5 lessons)
| # | Title | XP |
|---|---|---|
| 01 | Selectors & Specificity | 25 |
| 02 | The Box Model | 25 |
| 03 | Flexbox Layout | 30 |
| 04 | CSS Grid | 30 |
| 05 | Transitions & Animations | 35 |

### Chapter 3 — JavaScript (6 lessons)
| # | Title | XP |
|---|---|---|
| 01 | Variables & Types | 25 |
| 02 | Functions | 25 |
| 03 | Arrays & Loops | 30 |
| 04 | DOM Manipulation | 30 |
| 05 | Fetch & Async/Await | 40 |
| 06 | Build a Todo App | 50 |

**Total XP available: 455**

---

## ✨ Features

### Live Preview
Every time you click **Run** (or press `Ctrl+Enter`), your HTML, CSS, and JavaScript are injected into a sandboxed `<iframe>` and rendered instantly. The iframe uses `sandbox="allow-scripts"` for security.

### Syntax Highlighting
A custom regex-based highlighter (no external libraries) colorizes your code as you type. A transparent `<textarea>` sits on top of a styled `<div>` — you type into the textarea, the highlight layer underneath updates in sync.

Tokens highlighted:
- **HTML** — tags, attributes, attribute values, comments
- **CSS** — selectors, properties, values, hex colors (with live color swatch), comments
- **JS** — keywords, strings, template literals, numbers, booleans, function calls, comments

### Console Panel
`console.log()`, `console.warn()`, `console.error()`, and `console.info()` inside your code are intercepted via `postMessage` from the iframe and displayed in a dedicated console panel with timestamps and a red error badge counter.

### Code Buffers
Each lesson maintains its own independent code buffer for all three tabs. Edits to lesson 3's HTML don't affect lesson 5. Buffers persist in memory for the whole session.

### XP & Streak System
- Running a lesson for the first time awards its XP value
- Your XP total accumulates in the sidebar footer
- A streak counter tracks consecutive lesson runs

### Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `Ctrl + Enter` | Run code |
| `Ctrl + ]` | Next lesson |
| `Ctrl + [` | Previous lesson |
| `Ctrl + 1` | Switch to HTML tab |
| `Ctrl + 2` | Switch to CSS tab |
| `Ctrl + 3` | Switch to JS tab |
| `Ctrl + Shift + R` | Reset code to starter |
| `Ctrl + Shift + C` | Copy all code |
| `Escape` | Close any open panel |

### Auto-run
Toggle the **Auto** switch in the header. When on, the preview re-runs 0.9 seconds after you stop typing — no need to manually click Run.

### Preview Sizes
Switch between Desktop, Tablet (max 768px), and Mobile (max 390px) to test responsive designs.

### Draggable Resizer
Drag the thin bar between the editor and preview panels to give more space to whichever side you need.

### Lesson Search
Type in the sidebar search box to filter lessons by name or language tag in real time.

---

## 🔧 How to Extend It

### Add a new lesson
Open `curriculum.js` and add an object to any chapter's `lessons` array:

```js
{
  id:          "html-06",
  tag:         "HTML",
  title:       "Semantic Elements",
  xp:          25,
  paneTitle:   "06 · Semantic Elements",
  instruction: `<h2>Writing meaningful HTML</h2>
    <p>Use <code>&lt;header&gt;</code>, <code>&lt;main&gt;</code>,
    <code>&lt;article&gt;</code>, and <code>&lt;footer&gt;</code>
    instead of generic <code>&lt;div&gt;</code> elements.</p>
    <div class="hint-box">💡 Try adding a &lt;nav&gt; element!</div>`,
  html: `<!DOCTYPE html>\n<html>\n<body>\n  <header>...</header>\n</body>\n</html>`,
  css:  `body { font-family: sans-serif; padding: 20px; }`,
  js:   ``
}
```

The progress bar, XP total, sidebar, and nav buttons all update automatically.

### Add a new chapter
Add a new object to the `CURRICULUM` array in `curriculum.js`:

```js
{
  chapter: "Advanced JavaScript",
  lessons: [ /* your lessons here */ ]
}
```

### Change the color scheme
All colors are CSS custom properties in `:root` inside `styles.css`. Change `--cyan`, `--amber`, `--bg`, `--surface` etc. and the whole UI updates.

### Add a new keyboard shortcut
In `app.js`, find the `document.addEventListener("keydown", ...)` block at the bottom and add a new condition:

```js
if (ctrl && e.key === "s") { e.preventDefault(); saveLesson(); }
```

---

## 🏗️ Architecture Decisions

**Why no frameworks or build tools?**
The goal is a learning tool for people just starting out. Seeing a `node_modules` folder or a webpack config would be intimidating and irrelevant. Pure HTML/CSS/JS keeps the project itself inspectable and educational.

**Why a transparent textarea over a highlight div?**
This is the classic "fake syntax highlighting" trick used by CodeMirror's older versions and many simple editors. The textarea handles all native text editing behaviour (cursor, selection, undo/redo, mobile keyboards) while the div behind it shows the colorized version. The textarea's text is set to `color: transparent` with `caret-color: var(--cyan)` so you can still see where you're typing.

**Why postMessage for the console?**
The preview runs in a sandboxed `<iframe>`. Sandboxed iframes can't access the parent window's JavaScript. `postMessage` is the safe, standard way to communicate across the boundary. The app intercepts `console.log` inside the iframe and re-emits each call as a message to the parent, where it gets rendered in the console panel.

**Why separate `curriculum.js` from `app.js`?**
Content and logic should be separate. A teacher, student, or contributor can add lessons, fix typos, or rewrite instructions by touching only `curriculum.js` — no risk of breaking application logic. Similarly, `app.js` can be refactored without touching any lesson content.

---

## 📄 License

MIT — free to use, modify, and distribute for any purpose.
