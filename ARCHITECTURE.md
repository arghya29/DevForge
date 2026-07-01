# DevForge Architecture

## Overview

DevForge is a fully client-side interactive coding environment with zero runtime dependencies.
It consists of four core source files plus supporting configuration:

```
index.html        →  Skeleton (panels, buttons, modals, iframe)
styles.css        →  All visual styling (variables, layout, components, animations)
curriculum.js     →  Read-only lesson data (CURRICULUM array)
app.js            →  All application logic (state, editor, preview, console, XP)
```

## Data Flow

```
                    ┌─────────────┐
                    │ curriculum  │  (read-only frozen array)
                    │ .js         │
                    └──────┬──────┘
                           │ loaded by <script> order
                           ▼
                    ┌─────────────┐
                    │   app.js    │──► buildSidebar()
                    │             │──► loadLesson()
                    │  buffers    │──► initResizer()
                    │  doneSet    │──► runCode()
                    │  xp/streak  │──► showCompletion()
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │ Sidebar  │ │  Editor  │ │ Preview  │
       │ (lesson  │ │ (code    │ │ (iframe  │
       │  list)   │ │  area)   │ │  + cons.)│
       └──────────┘ └──────────┘ └──────────┘
```

## Key Design Decisions

### No Frameworks

DevForge deliberately uses zero JavaScript frameworks or build tools.
This keeps the project:

- **Inspectable** — any developer can open index.html and understand the full stack
- **Educational** — the audience is people learning their first lines of code
- **Zero-setup** — clone and open; no `npm install` required to run

### Separate curriculum.js

The curriculum is isolated from app logic so contributors can add lessons
by editing a single file with zero risk of breaking the application.

### Buffered Editing

Each lesson's HTML/CSS/JS code is stored in a `buffers` object keyed by
lesson ID. Edits persist in memory across tab switches and lesson navigation.
The curriculum itself is never mutated — it is deep-frozen at load time.

### Sandboxed Preview

User code runs inside `<iframe sandbox="allow-scripts">`. The sandbox
prevents access to the parent page's DOM. Console output is relayed via
`postMessage` — the iframe calls `parent.postMessage({ type, args })` and
the parent renders the messages in the console panel.

## State Management

| Variable       | Scope  | Persistence | Description                          |
| -------------- | ------ | ----------- | ------------------------------------ |
| buffers        | Memory | Session     | User's code edits per lesson per tab |
| doneSet        | Memory | Session     | Set of completed lesson IDs          |
| xp             | Memory | Session     | Total experience points              |
| streak         | Memory | Session     | Consecutive lesson completion streak |
| autorun        | Memory | Session     | Auto-run toggle state                |
| fsPanelVisible | Memory | Session     | Font size panel visibility           |

## Component Boundaries

### Sidebar (`buildSidebar`, `filterLessons`, `clearSearch`)

- Renders the lesson list grouped by chapter
- Supports real-time search filtering
- Highlights active lesson and marks completed ones

### Editor (`loadTab`, `switchTab`, `onEditorInput`, `handleEditorKey`)

- Three virtual file tabs (HTML, CSS, JS) per lesson
- Syntax highlighting via regex (no external parser)
- Auto-indent on Enter, auto-close brackets/quotes
- Undo/redo stacks per (lessonId, tab)
- Scroll position preservation per tab

### Preview (`runCode`, `buildPreviewDoc`, `extractBody`)

- Constructs a standalone HTML document from user code
- Injects console interception script
- Sets iframe `srcdoc` to render the preview
- Supports desktop/tablet/mobile viewport sizes

### Console (`addConsoleLog`, `clearConsoleUI`, `filterConsole`)

- Intercepts iframe console messages via `message` event
- Renders log/warn/error with timestamps
- Truncates long lines, limits total line count
- Auto-scroll lock when user manually scrolls up
- Real-time filter/search input

### XP System (`runCode`, `updateProgress`, `showCompletion`)

- Awards XP on first run of each lesson
- Tracks consecutive streak
- Updates progress bar in header
- Shows completion banner with confetti when all lessons done

## Build & CI Pipeline

```
Local dev          : open index.html
npm run lint:js    : ESLint (app.js, curriculum.js)
npm run lint:html  : html-validate (index.html)
npm run format:check : Prettier
GitHub Actions CI  : runs all three checks on PRs to dev and pushes to dev/main
GitHub Actions Deploy: auto-deploys main branch to GitHub Pages
```
