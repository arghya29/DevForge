# DevForge Codebase Guide

**Read this before you touch any code.** This document explains what every
file does, how they fit together, and what to do as the project grows. It's
written for contributors who are new to this codebase — and some parts are
written for contributors who are still fairly new to programming in general.
If a section feels too basic for you, skip ahead; nothing here assumes you
_haven't_ done this before, it's just written so that not having done it
before isn't a blocker either.

If you just want to add a lesson, `CONTRIBUTING.md` has a shorter, faster
guide for that specific task. Come back here when you want to understand
_why_ the project is built the way it is, or when you're touching something
other than lesson content.

---

## 1. What this project actually is, in one paragraph

DevForge is a website that is also a code editor. Someone opens `index.html`
in their browser, and JavaScript in that page builds the whole app: a text
editor for HTML/CSS/JS, a live preview, a console, and a sidebar of lessons.
There is no server. There is no build step. There is no framework. It's
"just" HTML, CSS, and JavaScript — the same three things the app teaches —
running directly in the browser, the same way a webpage from 2010 would.
That's a deliberate choice, not a limitation: it means anyone can clone the
repo and see it working in ten seconds, with nothing to install.

---

## 2. The one thing you must understand before editing any `js/*.js` file

This is the single most important idea in the whole codebase, and it's
different from how most modern JavaScript projects are built, so please
actually read this section.

### There is no bundler. Every file shares one global scope.

Most JavaScript projects today use `import`/`export` (ES modules) and a
build tool (Vite, Webpack, etc.) that combines everything into one file
before it reaches the browser. DevForge does **not** do this, on purpose —
see `README.md` for why (zero-build is a core project goal, and ES modules
don't reliably load over `file://`, which is how a lot of people will
literally run this app).

Instead, `index.html` loads twelve plain `<script>` tags, one after another:

```html
<script src="js/dom-utils.js"></script>
<script src="js/curriculum.js"></script>
<script src="js/state.js"></script>
<script src="js/store.js"></script>
<script src="js/highlighter.js"></script>
<script src="js/editor.js"></script>
<script src="js/preview.js"></script>
<script src="js/lessons.js"></script>
<script src="js/modals.js"></script>
<script src="js/commands.js"></script>
<script src="js/import-export.js"></script>
<script src="js/resizers.js"></script>
<script src="js/main.js"></script>
```

Here's the part that surprises people: even though these are twelve
_separate files_, a `const` or `function` declared in one of them is
directly usable in all the ones that load after it — as if the whole thing
were pasted into a single `<script>` tag. There's no `import` keyword
anywhere in `js/*.js`. If `curriculum.js` declares `const CURRICULUM = [...]`,
then `lessons.js` (which loads later) can just write `CURRICULUM` and use it
— no import, no `window.CURRICULUM`, nothing. This is standard, correct
browser behavior for classic (non-module) scripts; it just isn't something
most JavaScript developers run into day-to-day anymore, since almost
everything else uses a bundler now.

**What this means practically:**

- **Order matters.** A file can only use things declared in files that load
  _before_ it in that `<script>` list. `commands.js` can use `loadLesson`
  (from `lessons.js`, which loads earlier) — but `lessons.js` could _not_
  use something from `commands.js` at the top level of the file, because
  `commands.js` hasn't run yet at that point. (It's fine to use it _inside_
  a function or event listener, though — see the next point.)
- **Inside a function, order almost never matters**, because the function's
  body doesn't run until something calls it — usually a click, a keypress,
  or `init()` at the very end. By the time anyone clicks anything, all
  twelve files have already finished loading. So `editor.js` (which loads
  early) can freely call `resetCode()` (from `preview.js`, which loads
  later) inside a keyboard shortcut handler, because that handler only runs
  later, after everything is loaded.
- **Two files must never declare the same top-level name.** There's no
  module system to keep them separate, so `const state` in two different
  files would be a real conflict, not two independent variables.
- **Never use `import`/`export`/ES module syntax** in `js/*.js`. If you're
  used to modern JS and this feels wrong, that's a normal reaction — it's a
  deliberate, documented trade-off, not an oversight.

If you want to see exactly what "everything shares one scope" looks like in
practice, open `js/main.js` — it's twelve lines, and the very last line,
`init()`, freely calls functions from _five different files_ with no import
statements anywhere in sight.

---

## 3. Map of the whole project

```
devforge/
├── index.html              the page itself: structure + all <script>/<link> tags
├── css/                    five stylesheets, one per concern (see §5)
├── js/                     twelve scripts, one per concern (see §6) — the heart of the app
├── tests/                  Vitest test suite (see §7)
├── .github/                issue templates, PR template, CI workflow
├── package.json            dev tooling only (tests/lint) — NOT a runtime dependency of the app
├── eslint.config.js        lint rules, plus the list of "which file defines which global"
├── vitest.config.js        test runner config
├── .prettierrc.json        code formatting rules
├── README.md                what the project is, how to run it
├── CONTRIBUTING.md          contribution workflow + the fast lesson-adding guide
├── CODE_OF_CONDUCT.md
├── ROADMAP.md               where the project is headed, phase by phase
└── CODEBASE_GUIDE.md         this file
```

Nothing in `css/` or `js/` is fetched from anywhere external. No CDN links,
no npm packages shipped to the browser. `package.json` exists purely so
_contributors_ can run tests and linting on their own machine — a person
just using the app never needs Node.js installed at all.

---

## 4. How a click turns into a running app (the mental model)

Before the file-by-file walkthrough, it helps to see the shape of the whole
system once. Here's what happens when someone clicks a lesson in the
sidebar:

```
User clicks a lesson in the sidebar
        │
        ▼
loadLesson(id)                  ← lessons.js
   ├─ looks up the lesson in FLAT_LESSONS      ← curriculum.js (data)
   ├─ checks store.code for saved progress     ← store.js (persistence)
   ├─ updates state.files / state.currentLang  ← state.js (in-memory state)
   ├─ calls switchTab('html')                  ← editor.js
   │     └─ renderEditor() repaints the textarea + syntax highlighting
   │                                            ← highlighter.js
   ├─ calls renderLessonPanel()                 ← lessons.js
   │     └─ shows description, tip, hints, goals
   ├─ calls renderSidebar()                     ← lessons.js
   └─ calls runCode()                           ← preview.js
         └─ builds an HTML document from state.files and
            drops it into the sandboxed <iframe>
```

From then on, every keystroke in the editor re-runs a smaller version of
this loop: update `state.files` → re-highlight → re-check goals → (if
Auto-run is on) re-run the preview. Almost every feature in the app is a
variation on "read `state`/`store`, update the DOM, maybe write back to
`store`." If you understand that loop, you understand most of the codebase.

---

## 5. The CSS files

CSS is split by concern, matching the JS split. You don't need to touch CSS
you're not styling — each file only affects the part of the UI its name
describes.

| File                 | What it styles                                                                                                                                                                                          | Grows when...                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `css/base.css`       | Design tokens (`:root` CSS variables — colors, fonts, spacing), the light theme override, a global CSS reset, scrollbar styling, and accessibility basics (`.sr-only`, focus outlines, reduced-motion). | You're adding a new design token (a new color, a new spacing value) that multiple components will share. |
| `css/layout.css`     | The app "shell": top bar, sidebar, the main workspace split, panel headers, responsive rules. Structural, not decorative.                                                                               | You're changing where something _lives_ on the page, not what it looks like.                             |
| `css/editor.css`     | The code editor itself: line numbers, the syntax-highlighted overlay, the `tok-*` color classes, the lesson info panel below it, hints.                                                                 | You're touching anything inside the editor pane.                                                         |
| `css/components.css` | Small reusable pieces: the preview pane, the desktop/tablet/mobile toggle, the console panel, toast notifications.                                                                                      | You're building a new small, reusable UI piece that isn't a modal.                                       |
| `css/modals.css`     | Every modal (shortcuts, analytics, snippets, achievements) plus the layout-preset dropdown and the command palette.                                                                                     | You're adding a new modal or popover.                                                                    |

**When a CSS file gets too big:** split along a natural sub-boundary the
same way the original single stylesheet was split into these five — look
for the `/* ---- section ---- */` comments already in each file; those mark
where a future split would naturally happen. For example, if
`css/modals.css` keeps growing, "command palette" and "everything else"
would be a reasonable two-way split.

---

## 6. The JavaScript files, one by one

This is the core of the guide. For each file: what it's for, in plain
terms; the main things inside it; when you'd touch it; and what to do if it
outgrows itself.

### `js/dom-utils.js` (~85 lines) — tiny helpers everyone uses

**What it's for:** A handful of one-line helper functions so the rest of
the codebase doesn't repeat itself, plus one small startup snippet.

- **`$(selector)`** — shorthand for `document.querySelector(selector)`.
- **`$$(selector)`** — shorthand for `document.querySelectorAll(...)`,
  but returns a real array (so you can `.map()`/`.filter()` on it, which
  you can't do directly with what `querySelectorAll` returns).
- **`el(tag, props, children)`** — builds a DOM element without writing
  `document.createElement` and five lines of setup every time. Example:
  `el('div', { class: 'card', role: 'button' }, ['Hello'])`. Boolean HTML
  attributes (`disabled`, `checked`, `readonly`, etc. — see the
  `BOOLEAN_ATTRS` list at the top of the file) are reflected as real DOM
  properties rather than stringified attributes — this matters because
  `disabled="false"` is still _disabled_ as far as HTML is concerned (only
  the attribute's presence matters, not its string value), so `el()`
  handles that case correctly instead of naively calling `setAttribute`.
- **`escapeHtml(str)`** — turns `<`, `>`, `&`, `"`, and `'` into their safe
  HTML-entity equivalents, so user-typed or lesson text can't accidentally
  be interpreted as real HTML tags — or break out of an attribute value —
  when inserted into the page. Use this any time you interpolate a
  variable into a string that gets assigned to `.innerHTML`.
- **`toast(message)`** — shows the little bottom-right popup notification,
  and also announces the same message to screen readers via the ARIA live
  region.
- **`localDateString(date)`** — returns a `YYYY-MM-DD` string for the
  _local_ calendar day, unlike `Date#toISOString()` (always UTC, which
  would misattribute a late-night session to the wrong day for anyone not
  in UTC). Every place the app tracks "what day is it" — streaks,
  completion-date tracking, the analytics consistency calendar — goes
  through this one function so they can never disagree with each other.
- **A small startup snippet at the very top of the file** applies a saved
  theme preference (`localStorage['devforge:theme']`) before the page's
  first paint, to avoid a flash of the wrong theme. It has to live in the
  _first_ script that runs for that timing to matter — the rest of the
  theme toggle UI lives in `js/modals.js`.

**When you'd touch it:** almost never, unless you're adding a genuinely new
low-level helper that many files would use. This file is intentionally
small and boring — that's correct, not a gap.

**Loads first**, because literally every other file calls `$(...)` at some
point, and the early theme snippet needs to run before anything paints.

---

### `js/curriculum.js` (~460 lines and growing) — all lesson content

**What it's for:** This is the file you'll touch most often as a
contributor, and the one most likely to get big. It contains exactly two
things: the `PLAYGROUND` object (the free-play default) and the
`CURRICULUM` array (every lesson, grouped into categories), plus
`FLAT_LESSONS` (the same lessons flattened into one list, computed once).

A lesson looks like:

```js
{
  id: 'css-flexbox',          // permanent, unique, never renamed once shipped
  title: 'Flexbox Layout',
  tag: 'CSS',                 // must match its category
  xp: 30,
  html: '...', css: '...', js: '...',   // starter code
  description: '...',         // shown in the lesson panel (can include HTML)
  tip: '...',                 // shown in a highlighted callout box
  hints: ['...', '...'],      // optional — progressive hints, vague → specific
  goals: [
    { text: '...', check: files => /* return true/false */ }
  ]
}
```

**No other file needs to change to add a lesson.** Push a new lesson object
into the right category's `items` array (or add a new category object) and
the sidebar, navigation, XP, and progress tracking all pick it up
automatically. See `CONTRIBUTING.md` for the step-by-step version of this.

**This file has no DOM code in it at all** — no `$(...)`, no event
listeners, nothing browser-specific. It's pure data. That's intentional: it
makes lessons trivially testable (see `tests/curriculum.test.js`) and means
someone could write a new lesson without understanding _any_ of the rest of
the app.

**What needs attention as this file grows:**

- **This file will become the largest file in the project, and that's
  expected and fine** — up to a point. A curriculum of, say, 50–100 lessons
  is still just... a big array. `tests/curriculum.test.js` is what actually
  protects you here: it checks every lesson has a unique id, every `check()`
  function runs without crashing, and no required field is missing. As long
  as that test suite stays green, a big `curriculum.js` isn't dangerous,
  just long.
- **If it gets unwieldy to scroll through**, the natural split is **one
  file per category**: `js/curriculum/html.js`, `js/curriculum/css.js`,
  `js/curriculum/javascript.js`, each exporting (in the classic-script
  sense — just declaring) its own category array, with a small remaining
  `js/curriculum.js` that assembles `CURRICULUM` from the pieces and
  computes `FLAT_LESSONS`. If you do this split, remember: **you must also
  update the `<script>` tag list in `index.html`, and the `JS_LOAD_ORDER`
  array in `tests/helpers/loadApp.js`** — see the big warning box in §8.
- **Goal-checking is currently regex-based**, which is simple and readable
  but can be fooled by code that's technically different but
  functionally the same (or vice versa). This is a known, accepted
  trade-off for now — see `ROADMAP.md` Phase 2 for the idea of a proper
  AST-based checker for JS goals specifically, if you want to pick that up.
- **Only 5 lessons currently have `hints`.** Adding hints to more lessons
  is genuinely useful, low-risk, contributor-friendly work — a great first
  PR if you're looking for one.

---

### `js/state.js` (~16 lines) — what's happening _right now_

**What it's for:** One object, `state`, holding everything about the
_current session_ that doesn't need to survive a page reload: which lesson
is open, which tab (HTML/CSS/JS) is active, the actual code currently in
the editor, whether Auto-run is on, which hints have been revealed, etc.

**The distinction that matters:** `state` (this file) is temporary,
in-memory, and reset every time the page reloads. `store` (next file) is
what actually gets saved to `localStorage` and survives a reload. If you're
adding something that should be remembered next time the learner opens the
app, it belongs in `store`, not `state`. If it's just "what's on screen
right now," it belongs in `state`.

**When you'd touch it:** whenever a new piece of session-only UI state
needs a home — e.g. `hintsRevealed` was added here when hints shipped.

**Growth:** this file should stay small forever. If it's growing a lot,
that's usually a sign some of what you're adding actually belongs in
`store.js` instead (ask: "should this survive a reload?").

---

### `js/store.js` (~130 lines) — everything that gets saved

**What it's for:** Reading and writing `localStorage`, and everything built
on top of that: XP totals, streaks, completed lessons, time spent per
lesson, retry counts, saved code per lesson, snippets.

Key pieces:

- **`defaultStore()`** — the shape of a brand-new learner's data. If you add
  a new persisted field anywhere in the app, add it here too, with a
  sensible default, or existing users' saved data won't have it after your
  change ships (see the note on `loadStore()`'s merge behavior below).
- **`loadStore()` / `saveStore()`** — read/write the single `localStorage`
  key (`devforge:v1`). `loadStore()` merges saved data _over_
  `defaultStore()`, which is what makes the app forward-compatible: if
  someone's saved progress is missing a field that didn't exist yet when
  they saved it, they still get the default for that field instead of
  `undefined` breaking something. `saveStore()` warns the learner (once per
  failure episode, not spammed on every keystroke) if `localStorage` write
  fails — private browsing and a full storage quota are real cases, not
  hypotheticals, and failing silently there meant progress could vanish
  with zero feedback.
- **`isValidStoreShape(data)`** — checks that a parsed JSON blob at least
  roughly matches what a real export would look like (right field types,
  the two identifying fields present) before `js/import-export.js` trusts
  it enough to replace the live store. It doesn't need to be exhaustive —
  just enough to stop an unrelated or corrupted file from crashing
  something later (e.g. `store.completed.includes(...)` if `completed`
  weren't actually an array).
- **`updateStreak()`** — the daily-streak logic (same day = no-op,
  yesterday = +1, anything older = reset to 1), based on the learner's
  _local_ calendar day via `localDateString()` (see `dom-utils.js`) — not
  UTC, which would misattribute a late-night session to the wrong day.
  Runs once automatically every time the app loads, via `init()` in
  `main.js`.
- **`totalXP()`** — sums `xp` for every lesson id in `store.completed`.
- **The timer functions (`startTimer` / `flushTimer`)** — track how long a
  learner spends on each lesson, for the Learner Analytics modal. Called
  from `loadLesson()` whenever the active lesson changes.

**What needs attention:** this is the file where a bug would be most
damaging — it's the only place that touches a real user's saved progress.
Any change here should be covered by a test in `tests/storage.test.js`
before it ships. If you're adding a new field, always ask: what should
happen to an _existing_ user's data that doesn't have this field yet? (See
the "lesson versioning" logic in `js/lessons.js`/`js/editor.js` for a real
example of handling exactly this kind of forward-compatibility problem for
per-lesson saved code.)

---

### `js/highlighter.js` (~95 lines) — turning code into colored HTML

**What it's for:** Dependency-free syntax highlighting. No CodeMirror, no
Prism — just regular expressions that find comments/strings/keywords/etc.
in a string of code and wrap them in `<span class="tok-...">` tags, which
the CSS in `css/editor.css` then colors.

The core function is `highlight(code, lang)`, which delegates to
`highlightJS`, `highlightCSS`, or `highlightHTML` depending on `lang`.
Each of those is built from one big regular expression (`RE_JS`, `RE_CSS`,
`RE_HTML`) with a numbered capture group per token type, plus a small
`classify()` function that maps "which group matched" to a CSS class name.

**When you'd touch it:** if highlighting looks wrong for some code pattern
(a missed keyword, a string that isn't detected, etc.), or if you're adding
support for a new "token type" to color differently.

**What needs attention:** regex-based highlighting is inherently
approximate — it will occasionally get something slightly wrong on unusual
code, and that's an accepted trade-off for staying dependency-free. If you
find a case where it visibly breaks (e.g. produces broken HTML, not just a
wrong color), that's a real bug worth fixing; a slightly wrong color on an
edge case usually isn't worth much engineering effort.

**Performance note:** `highlight()` re-processes the _entire_ buffer every
time it's called — there's no incremental/diff-based highlighting. This is
fine at lesson-sized files. `js/editor.js` already debounces calls to this
function above 4000 characters specifically to keep this cheap trade-off
from becoming a real slowdown — see the note in that file's section below
before changing that threshold.

---

### `js/editor.js` (~170 lines) — the actual code editor widget

**What it's for:** Turning a plain `<textarea>` into something that looks
and feels like a real code editor: line numbers, syntax-colored overlay,
Tab-to-indent, Shift+Tab-to-outdent, and keeping everything in sync as you
type.

**The trick worth understanding:** there are actually _two_ overlapping
elements — a `<textarea>` (invisible text, real cursor, real typing) sitting
exactly on top of a `<pre><code>` (visible colored text, not interactive).
You're always typing into the invisible textarea; what you _see_ is the
`<pre>` underneath being repainted after every keystroke. `css/editor.css`
is what makes this illusion pixel-perfect (identical font, padding, line
height on both elements).

Key pieces:

- **`renderEditor()`** — full repaint: used when a lesson loads or a tab
  switches. Always immediate (never debounced) since it's not a hot path.
- **The `input` listener** — runs on every keystroke: updates `state`,
  re-highlights (via `scheduleHighlight`, debounced above 4000 characters —
  see the perf note in the highlighter section), updates line numbers,
  saves progress, checks goals.
- **`switchTab(lang)`** — swaps which of HTML/CSS/JS is currently shown.
- **The `keydown` listener** — Tab/Shift+Tab for indent/outdent, plus a
  second copy of several keyboard shortcuts (Ctrl+Enter, Ctrl+Shift+R,
  etc.) so they work even while focus is inside the textarea, where the
  document-level shortcut listener in `modals.js` would otherwise be
  blocked by default browser textarea behavior for some keys.

**When you'd touch it:** anything about how typing _feels_ — indentation
behavior, keyboard shortcuts scoped to the editor, the highlighting
debounce threshold.

**Growth:** if this file starts accumulating unrelated features (e.g. a
minimap, multi-cursor support), that's a sign to split it — e.g.
`js/editor-core.js` (rendering/highlighting sync) and
`js/editor-keyboard.js` (shortcut handling) as two files, loaded back to
back. Don't split preemptively; 170 lines doing one coherent job is fine.

---

### `js/preview.js` (~175 lines) — running the code and capturing output

**What it's for:** Turning `state.files` (the current HTML/CSS/JS) into an
actual running web page inside the sandboxed `<iframe>`, and getting
`console.log`/errors back out of that iframe into our own console panel.

Key pieces:

- **`buildDoc(html, css, js)`** — takes the three code strings and produces
  one complete HTML document: injects `<style>` into `<head>` (or creates a
  `<head>` if there isn't one), and injects a `<script>` (console-capture
  code + the learner's JS) before `</body>`. Handles both "full HTML
  document" starter code and plain fragments. Before embedding `css`/`js`,
  it runs them through `escapeRawTextClose()`, which neutralizes any
  literal `</script` or `</style` sequence in the learner's own code (e.g.
  `console.log("</script>")` is completely reasonable code to write) —
  without that, the browser's HTML parser would see that literal text and
  close our injected tag early, corrupting the whole preview document. See
  the comment above that function for exactly how (and why the fix doesn't
  change what the code actually does when it runs).
- **`CONSOLE_CAPTURE_SRC`** — a string of JavaScript that gets injected
  _into the iframe itself_. It overrides `console.log`/`warn`/`error` to
  also `postMessage` each call back up to the parent page, and listens for
  uncaught errors and unhandled promise rejections to report those too.
- **The `message` event listener** — receives those `postMessage` calls
  from the iframe and turns them into lines in the console panel. This
  listener explicitly checks `event.source` matches our own iframe's
  `contentWindow` before trusting anything — **don't remove that check**;
  it's a deliberate security hardening (see `ROADMAP.md` Phase 1), not
  incidental code.
- **`runCode()`** — orchestrates a run: logs "Running…", builds the
  document, sets it as the iframe's `srcdoc`.
- **`resetCode()` / `emptyCode()` / `exportCode()`** — the three
  code-clearing/exporting actions in the preview toolbar.
- **Device view toggle** — switches the iframe's width to simulate
  desktop/tablet/mobile.

**When you'd touch it:** anything about _running_ code (not editing it) —
how the preview document is assembled, what counts as a console message,
retry-tracking on errors.

**What needs attention:** the iframe is `sandbox="allow-scripts allow-forms
allow-modals allow-popups"` with **no** `allow-same-origin` — that's
intentional and important for security (it keeps the learner's code from
being able to reach back into the parent page or read cookies/storage).
If you're ever tempted to add `allow-same-origin` to fix some preview
limitation, stop and open an issue first — it would undo a real security
boundary, not just a convenience setting.

---

### `js/lessons.js` (~300 lines) — the lesson panel and sidebar

**What it's for:** Everything about _navigating and displaying_ lesson
content — as opposed to `curriculum.js`, which just holds the data. If
`curriculum.js` is the textbook, this file is the bookshelf and the
reading pane.

Key pieces:

- **`loadLesson(id)`** — the central function described in §4. Almost
  every user action eventually calls this.
- **`renderLessonPanel()`** — fills in the description, tip, hints, and
  goals UI for whichever lesson is active.
- **`renderGoals()` / `checkGoals()`** — runs every goal's `check()`
  function against the current code, updates the checklist UI, and awards
  XP + marks the lesson complete the first time every goal passes.
- **`renderHints()`** — the progressive-hints UI: shows however many hints
  the learner has revealed so far, and updates the "show a hint" button.
- **`renderSidebar()`** — rebuilds the whole curriculum sidebar: the
  Playground pin, each category (collapsible), and every lesson item
  (with its progress dot, XP, search filtering).
- **`prevLesson()` / `nextLesson()`** — flat-list navigation, ignoring
  categories.

**When you'd touch it:** how lessons are _presented_ — sidebar layout,
goal-checking behavior, hints, navigation order.

**What needs attention:**

- This is the second-largest file after `curriculum.js`, and it's carrying
  three related-but-separable responsibilities: the lesson panel, the
  goals/hints system, and the sidebar. If it keeps growing, that's the
  natural three-way split: `js/lesson-panel.js`, `js/goals.js` (or fold
  hints in with goals, since they're closely related), `js/sidebar.js`.
  As always, update the load order in `index.html` and
  `tests/helpers/loadApp.js` if you do this.
- Every clickable thing this file creates dynamically (sidebar items,
  category headers) is built with `role="button"`, `tabindex="0"`, and a
  matching `keydown` handler for Enter/Space — **this pattern needs to be
  followed for anything new you add here**, or you'll reintroduce the
  keyboard-accessibility gap that was specifically fixed (see
  `ROADMAP.md` Phase 1). Search this file for `activateOnEnterOrSpace` to
  see the existing pattern to copy.

---

### `js/modals.js` (~410 lines) — the largest single file; several small features living together

**What it's for:** This file currently holds several related-but-distinct
features that all happen to be "a button that opens a modal":

- Workspace layout presets (Default / Wide Editor / Wide Preview / Minimal)
- Theme toggle (light/dark)
- **Focus trapping** (`openModal`/`closeModal`/`getFocusable`) — the
  generic accessibility machinery every modal relies on
- The Keyboard Shortcuts modal (mostly static content)
- Learner Analytics (the 7-day consistency tracker + per-lesson stats table)
- Code Snippets (save/load/delete named code snapshots)
- Achievements (`ACHIEVEMENTS` array + unlock-checking + badge rendering)
- The global keyboard shortcut listener (Ctrl+], Ctrl+[, Ctrl+1/2/3, Esc,
  etc.)

**This is honestly the best candidate in the whole codebase for a split**,
and it's explicitly fine to do sooner rather than later — this file grouping
happened because these features were built one at a time onto "the modals
file" rather than because they're deeply related. A natural split:

- `js/a11y.js` — `openModal`/`closeModal`/`closeAllModals`/`getFocusable`
  and the Tab-trapping listener (used by _every_ modal, including future
  ones)
- `js/layout.js` — the layout presets + theme toggle
- `js/analytics.js` — the Learner Analytics modal
- `js/snippets.js` — the Code Snippets modal
- `js/achievements.js` — the Achievements modal
- A much smaller `js/modals.js` left with just the Keyboard Shortcuts modal
  and the global shortcut listener, or fold the shortcut listener into
  `main.js`

If you do this split (or any part of it), remember the three-places rule in
§8 below, and note that `commands.js` (which loads after `modals.js`)
calls into several of these — e.g. `applyLayout`, `openModal` — so anything
you rename needs the "cross-file globals" section of `eslint.config.js`
updated too.

**When you'd touch it (before it's split):** any of the six features above.
Look for the section comments (`/* workspace layout dropdown */`, `/* code
snippets */`, etc.) to find the right spot — they already mark exactly
where each feature's code lives, which is effectively a preview of where
the file split seams should go.

---

### `js/commands.js` (~330 lines) — the command palette

**What it's for:** The Ctrl/Cmd+K command palette: a searchable list of
every lesson plus every action in the app.

Key pieces:

- **`registerCommand({ id, label, group, shortcut, action })`** — adds one
  entry to the palette. This is the extension point: if you add a new
  feature anywhere else in the app and want it reachable from the palette
  (you almost always do — see `ROADMAP.md`'s framing of the palette as
  central to the project's whole identity), call `registerCommand()` for
  it. You don't need to modify any palette-internal code to do this.
- **`fuzzyScore()` / `filteredCommands()`** — the search/ranking logic:
  exact substring matches rank highest, then falls back to a simple
  subsequence match (so typing "gtl" can still find "Go to lesson").
- **`copyAllCode()`** — bundles HTML+CSS+JS into one labeled clipboard copy.
- The bottom third of the file is just a long list of `registerCommand()`
  calls wiring up existing actions from other files — this is meant to be
  boring and repetitive; that's what a "manifest of everything the app can
  do" should look like.

**When you'd touch it:** adding a new command, or changing search ranking.

**Growth:** the `registerCommand()` calls at the bottom will grow linearly
with every new feature — that's fine and expected, it's meant to be a flat
list, not something that needs restructuring. If the _search logic_ itself
needs real fuzzy-matching (not just substring + subsequence), that's a
self-contained, low-risk thing to improve without touching anything else.

---

### `js/import-export.js` (~35 lines) — progress backup/restore

**What it's for:** Two buttons: download all of `store` as a JSON file, or
upload a previously-downloaded one to restore it. This is the project's
current answer to "what if I want my progress on another computer" — see
`ROADMAP.md` Phase 4 for the bigger, optional-accounts version of this idea.

**When you'd touch it:** rarely. If `store`'s shape changes (see
`js/store.js`), double check `defaultStore()`'s merge behavior still makes
imported older files work correctly.

---

### `js/resizers.js` (~110 lines) — draggable, keyboard-operable panel dividers

**What it's for:** One shared implementation, `makeResizer(opts)`, used
twice: the vertical divider between editor and preview (resizes a width),
and the horizontal divider that resizes the console panel (resizes a
height). They only differ in which CSS property they change and which
mouse axis they watch — everything else (drag handling, clamping to
min/max, keyboard support, ARIA state) is identical, so it's one function
instead of two near-duplicate ones.

Each divider is a real `role="separator"` with `aria-valuenow`/`min`/`max`,
is reachable via Tab, and responds to arrow keys (grow/shrink by a fixed
step) plus Home/End (jump straight to min/max) — not just mouse dragging.

One perf detail worth knowing if you touch this: the container size is
measured once per drag (`getBoundingClientRect()` at `mousedown`, cached
for the whole drag), not on every single `mousemove` — recomputing layout
on every mouse-move event is a real, measurable cost on a hot path like
this.

**When you'd touch it:** only if you're changing how resizing behaves (min/
max sizes, the keyboard step size) or adding a new resizable panel — in
which case, call `makeResizer()` a third time rather than writing new
drag-handling logic.

---

### `js/main.js` (~12 lines) — boots the app

**What it's for:** The very last file loaded. Its only job is `init()`,
which calls a handful of functions from other files to get the app into
its starting state (today's streak counted, XP shown, sidebar built,
Playground loaded).

**This file must always load last.** If you split any other file into
pieces, `main.js` still needs to be the final `<script>` tag, since `init()`
assumes everything else already exists.

**When you'd touch it:** almost never — only if the app's startup sequence
itself needs to change (e.g. a new one-time setup step at boot).

---

## 7. The `tests/` folder

Every `tests/*.test.js` file uses [Vitest](https://vitest.dev/). Run them
all with `npm test`.

| File                       | What it checks                                                                                                                                                                                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/curriculum.test.js` | The most important test file in the project. Every lesson has a unique id, all required fields, 1–5 goals, and every goal's `check()` function runs without crashing — even against empty or garbage input. If you add a lesson and this fails, it's telling you something concrete and specific. |
| `tests/storage.test.js`    | `defaultStore()`'s shape, `loadStore()`/`saveStore()` round-tripping, `totalXP()`, and the streak-counting logic (same day / consecutive day / gap).                                                                                                                                              |
| `tests/editor.test.js`     | Syntax highlighting output, tab switching, typing updates state, Tab-key indentation, per-lesson autosave.                                                                                                                                                                                        |
| `tests/app.test.js`        | End-to-end-style checks: clicking a sidebar lesson actually loads it, completing all goals awards XP exactly once (not twice), Reset restores the right thing for a lesson vs. the Playground.                                                                                                    |
| `tests/commands.test.js`   | The command palette: opening/closing, search filtering, keyboard navigation, executing a command, `registerCommand()` extensibility.                                                                                                                                                              |
| `tests/analytics.test.js`  | The Learner Analytics modal: the stats table, retry counting on a simulated preview error, the consistency tracker, Reset Analytics.                                                                                                                                                              |
| `tests/a11y.test.js`       | Focus trapping, focus returning to the trigger element, Tab-wrapping inside an open modal, Escape closing modals, the ARIA live region, and that sidebar items/category headers are keyboard-operable.                                                                                            |
| `tests/helpers/loadApp.js` | Not a test file — the shared harness every test file imports. Explained in detail below.                                                                                                                                                                                                          |

### How the tests actually work (worth understanding before writing new ones)

DevForge has no module system, which makes it slightly unusual to test.
`tests/helpers/loadApp.js` solves this by loading the **real** `index.html`
and the **real** `js/*.js` files into a fresh, isolated browser-like
environment ([jsdom](https://github.com/jsdom/jsdom)) for every single test
— genuinely running the app, not a simplified stand-in for it.

One non-obvious wrinkle, in case you ever touch this file: jsdom's
`window.eval()` does **not** share `let`/`const` scope across separate
calls the way real sequential `<script>` tags do — this actually broke
every single test the first time this harness was built. The fix was to
load the app's JS as genuine injected `<script>` elements
(`document.createElement('script')`), which _does_ correctly share scope,
exactly like a real browser loading `index.html`. If you're ever tempted to
"simplify" `loadApp.js` back to a plain `window.eval(...)` call, don't —
that regression is easy to reintroduce and hard to notice until tests start
failing in confusing ways.

Every test file calls `createApp()` from that helper, which returns:

```js
const { window, document, get } = createApp({ seedStore: {...} });
```

- `window` / `document` — the real thing; use normal DOM APIs
  (`document.getElementById`, `.dispatchEvent(new window.MouseEvent(...))`,
  etc.) to interact with the app exactly like a user would.
- `get(expression)` — runs a JS expression _inside_ the app's own scope and
  returns the result. This is how tests reach things like `CURRICULUM`,
  `store`, or call a function like `loadLesson(...)` directly. It only
  accepts a single expression (not multiple `;`-separated statements) —
  chain side effects with the comma operator if you need to, e.g.
  `get("store.streak = 9, saveStore(store)")`.
- `seedStore` — pre-populates `localStorage` before the app boots, as if a
  learner already had saved progress.

One more real gotcha worth knowing: `main.js` calls `init()` automatically
the moment it loads — which happens inside every `createApp()` call, not
just when a test explicitly asks for it. That means `updateStreak()` and
`loadLesson(PLAYGROUND.id)` (which itself calls `runCode()`) already ran by
the time your test code runs. If you're seeding `streak`/`lastActive` and
your numbers don't come out how you expect, this is almost always why —
see `tests/storage.test.js` for a real example of accounting for it (seed
`lastActive` as today's date so the automatic `updateStreak()` call is a
no-op instead of silently resetting your seeded streak).

---

## 8. ⚠️ The three places that must stay in sync

This is the single easiest way to accidentally break the app while adding
something totally unrelated. If you ever add a new `js/*.js` file, or
reorder/split an existing one, **all three of these must be updated
together**:

1. **`index.html`** — the `<script src="js/...">` tags, near the bottom of
   the file. This is the actual load order the real app uses.
2. **`tests/helpers/loadApp.js`** — the `JS_LOAD_ORDER` array at the top of
   the file. This must exactly match #1, in the same order, or tests will
   be checking a different app than the one that actually ships.
3. **`eslint.config.js`** — the `appGlobals` object. If your new file
   declares something other files will use (a function, a shared object),
   add it here, grouped under a comment naming which file defines it, or
   ESLint will report false "undefined variable" errors in every file that
   uses it.

There's no automated check that catches you forgetting one of these three
right now — reviewers should watch for this specifically on any PR that
touches file structure.

---

## 9. Walkthroughs for common tasks

**"I want to add a lesson."** → See `CONTRIBUTING.md`. You only need to
touch `js/curriculum.js`.

**"I want to add a new toolbar button."** Add the `<button>` in
`index.html`, style it in the relevant `css/*.css` file, wire up its click
handler in whichever `js/*.js` file matches what it _does_ (a preview
action → `preview.js`, a modal → `modals.js`, etc.), and register it in
`js/commands.js` with `registerCommand()` so it's also reachable from the
palette.

**"I want to add a new modal."** Copy the HTML structure of an existing
modal in `index.html` (e.g. the Achievements modal) for consistency, add
its styles to `css/modals.css`, and reuse `openModal(id)` / `closeModal(id)`
from `js/modals.js` — don't build your own show/hide logic, since
`openModal`/`closeModal` already handle focus trapping and keyboard
accessibility for you.

**"I want to add a new keyboard shortcut."** Add it to the global
`keydown` listener in `js/modals.js` (or the editor-scoped one in
`js/editor.js` if it should work while typing), and add a row for it to
the Keyboard Shortcuts modal's HTML in `index.html` so learners can
actually discover it.

**"I want to change something about saved progress."** Start in
`js/store.js`. Update `defaultStore()` first, think through what happens
to an existing user's data that doesn't have your new field yet, then add
a test in `tests/storage.test.js` before writing the feature that uses it.

---

## 10. Things that genuinely need attention right now

Being upfront about what's incomplete, in rough priority order:

- **Keyboard accessibility is good, not complete.** Modals trap focus and
  are exposed as real dialogs, every custom clickable control (sidebar
  items, category headers, layout presets, the resizable dividers) is
  keyboard-operable and tested by actually checking focus reachability —
  but there's been no full manual pass with an actual screen reader
  (NVDA/VoiceOver). If you use one day-to-day, this would be a genuinely
  valuable contribution — automated tests can confirm the ARIA wiring is
  correct, not what it actually sounds like.
- **`js/modals.js` should be split** — see its section above. It works
  fine today; it just has more unrelated responsibility in one file than
  anything else in the project.
- **Only 5 lessons have `hints`.** Low-risk, high-value, good first PR.
- **Goal-checking is regex-only.** Works well, but an AST-based checker for
  JS specifically would be more precise. See `ROADMAP.md` Phase 2. Worth
  knowing: this project shipped three lessons (`html-first-element`,
  `js-variables`, `js-fetch-async`) where the starter code accidentally
  satisfied every goal already — nothing wrong with the regexes
  themselves, but a reminder that goal design and starter-code design have
  to be checked _together_. `tests/curriculum.test.js` now has a
  permanent regression test for this specific failure mode.
- **No lesson has ever needed its `version` bumped.** The forward-
  compatibility logic for stale saved code is tested but not yet proven by
  a real content change — worth watching the first time a lesson's starter
  code changes significantly.
- **Large-scale performance is untested.** Everything is fast at 19
  lessons on a normal laptop. Nobody has tested with, say, 200 lessons, or
  on genuinely low-end hardware (a real concern given the target audience
  — see `ROADMAP.md`).

---

## 11. Quick glossary

If any of these terms in this doc (or in the code) are unfamiliar:

- **DOM** — "Document Object Model." The browser's live, in-memory
  representation of the page as a tree of objects, which JavaScript can
  read and modify (`document.getElementById(...)` reaches into it).
- **Event listener** — a function that runs in response to something
  happening (a click, a keypress, a form input). `element.addEventListener('click', fn)`.
  registers `fn` to run whenever `element` is clicked.
  - **classic script vs. module script** — a classic script is the plain,
    original `<script src="...">` behavior every browser has always had
    (what this project uses). A module script (`<script type="module">`)
    is the newer `import`/`export` system, which this project deliberately
    does not use — see §2.
- **`localStorage`** — a small key-value store the browser gives every
  website, that persists across page reloads (until explicitly cleared).
  This is how DevForge remembers your progress without a server.
- **Sandboxed iframe** — an `<iframe>` with restricted permissions (the
  `sandbox` attribute), used here to run a learner's code safely, without
  letting it interfere with the rest of the page.
- **Debounce** — delaying an action until a burst of triggering events has
  paused, so something expensive doesn't re-run on every single keystroke.
- **ARIA / ARIA live region** — attributes that describe a page's meaning
  and state to assistive technology like screen readers. A "live region"
  is a part of the page a screen reader will automatically announce
  whenever its content changes, even if the user isn't focused on it.
- **Regex (regular expression)** — a pattern-matching mini-language for
  finding/checking text, e.g. `/<h1[\s>]/i` matches an `<h1` tag.
- **jsdom** — a JavaScript library that simulates a browser's DOM in
  Node.js, without an actual browser — what the test suite runs against.

---

Questions this guide doesn't answer? Open an issue — and if the answer
turns out to be something this document should have covered, that's useful
feedback for improving it, not a failure on your part for not finding it.
