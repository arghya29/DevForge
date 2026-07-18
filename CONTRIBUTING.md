# Contributing to DevForge

Thanks for considering contributing! This project is still early, so please
open an issue before starting large changes — it's much easier to align on
direction before code is written than after.

> **New to this codebase?** This document covers the contribution
> _workflow_. For a full, beginner-friendly explanation of what every file
> does, how they fit together, and what to watch out for, read
> [`CODEBASE_GUIDE.md`](./CODEBASE_GUIDE.md) first — especially before
> touching anything in `js/`.

## Ground rules

- No build step, no bundler, no ES modules, no external runtime
  dependencies for the app itself. DevForge must keep working by opening
  `index.html` directly. Dev-only tooling (tests, linting) is fine as a
  `devDependency`.
- Keep files scoped to one concern. If a file is growing unrelated
  responsibilities, that's a sign it should be split, not a sign to keep
  adding to it.
- Every new file-level module gets a short header comment explaining what
  it's responsible for (see any existing `js/*.js` file for the pattern).

## Setup

```bash
git clone https://github.com/<org>/devforge.git
cd devforge
npm install        # only needed for tests/lint, not to run the app
npm test
npm run lint
```

To work on the app itself, just open `index.html` in a browser — reload
after each change, no build step.

## Adding a lesson (the fastest way to contribute)

All lesson content lives in **`js/curriculum.js`**. Nothing else needs to
change to add a lesson — the sidebar, XP, goal-checking, and navigation all
read from this one file.

A lesson looks like this:

```js
{
  id: 'css-transitions',        // unique, kebab-case, never reused or reassigned
  title: 'Transitions & Animations',
  tag: 'CSS',                   // 'HTML' | 'CSS' | 'JS' — must match its category
  xp: 35,
  html: '<!DOCTYPE html>\n...', // starter HTML (a full document, not a fragment)
  css: '.btn{ ... }\n',         // starter CSS
  js: '',                       // starter JS (can be empty)
  description: '<h3>Smooth changes</h3><p>...</p>',  // shown in the lesson panel
  tip: 'One-sentence tip shown in a callout box.',
  goals: [
    {
      text: 'Sets a transition property',   // shown to the learner
      check: f => /transition\s*:/.test(f.css)   // f = { html, css, js }, return boolean
    },
    // 2–3 goals is the sweet spot — enough to guide, not so many it feels graded
  ]
}
```

Push it into the `items` array of the right category in `CURRICULUM`, or
start a new category object if it doesn't fit an existing one. That's the
entire integration — sidebar rendering, progress tracking, and navigation
are all automatic.

**Guidelines for `check()` functions:**

- Test against `f.html` / `f.css` / `f.js` (whichever is relevant) using a
  regex or simple string check. Keep it forgiving — check for the _presence_
  of the right idea, not exact formatting.
- Each goal should be checkable independently of the others.
- Run `npm test` before opening a PR — `tests/curriculum.test.js` checks
  every lesson has a unique `id` and that every `check()` function runs
  without throwing on empty input.

**Guidelines for lesson IDs:** once a lesson ships, its `id` is permanent —
it's used as the key for saved progress, completion, and time-tracking. If a
lesson's content changes substantially enough that old saved code no longer
makes sense, bump its `version` field (see "Lesson versioning" below)
instead of changing the `id`.

### Lesson versioning

Lessons can optionally include a `version` number (defaults to `1` if
omitted). Bump it when you change a lesson's starter code or goals in a way
that would make a learner's previously-saved progress on it stale or
confusing. The app compares the saved version against the current one and
lets the learner know their saved code is from an older version of the
lesson, rather than silently mixing old code with new goals.

## Where things live

| Concern                                                              | File                  |
| -------------------------------------------------------------------- | --------------------- |
| Lesson content                                                       | `js/curriculum.js`    |
| In-memory UI state                                                   | `js/state.js`         |
| Saved progress (XP, streak, completed lessons)                       | `js/store.js`         |
| Syntax highlighting                                                  | `js/highlighter.js`   |
| The code editor itself                                               | `js/editor.js`        |
| Preview / console capture                                            | `js/preview.js`       |
| Lesson panel, goals, sidebar                                         | `js/lessons.js`       |
| Modals (shortcuts, analytics, snippets, achievements), theme, layout | `js/modals.js`        |
| Command palette                                                      | `js/commands.js`      |
| Export/import progress                                               | `js/import-export.js` |
| Draggable dividers                                                   | `js/resizers.js`      |
| App bootstrap (loaded last)                                          | `js/main.js`          |

## Tests

We use [Vitest](https://vitest.dev/) with jsdom. Please add or update a test
for any behavioral change — see `tests/` for examples. `tests/curriculum.test.js`
in particular should stay green for every PR that touches lesson content.

## Accessibility

DevForge is a learning tool; it needs to work for keyboard-only and
screen-reader users. If you add an interactive element (a button, modal,
etc.), it needs to be reachable and operable by keyboard, and modals need to
trap focus while open. Please test with the keyboard alone before opening a
PR that adds UI.

## Code style

Run `npm run format` before committing. CI will fail on formatting or lint
errors — this keeps diffs small and reviews focused on substance.
